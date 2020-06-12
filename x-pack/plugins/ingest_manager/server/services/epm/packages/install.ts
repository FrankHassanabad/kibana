/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObject, SavedObjectsClientContract } from 'src/core/server';
import Boom from 'boom';
import { installPrepackagedRules } from '../../../../../security_solution/server/lib/detection_engine/rules/install_prepacked_rules';
import { getPrepackagedRules } from '../../../../../security_solution/server/lib/detection_engine/rules/get_prepackaged_rules';
import { getExistingPrepackagedRules } from '../../../../../security_solution/server/lib/detection_engine/rules/get_existing_prepackaged_rules';
import { AlertsClient } from '../../../../../alerts/server';
import { PACKAGES_SAVED_OBJECT_TYPE } from '../../../constants';
import {
  AssetReference,
  Installation,
  KibanaAssetType,
  SecurityAssetType,
  CallESAsCurrentUser,
  DefaultPackages,
  ElasticsearchAssetType,
  IngestAssetType,
} from '../../../types';
import { installIndexPatterns } from '../kibana/index_pattern/install';
import * as Registry from '../registry';
import { getObject, getRules } from './get_objects';
import { getInstallation, getInstallationObject } from './index';
import { installTemplates } from '../elasticsearch/template/install';
import { generateESIndexPatterns } from '../elasticsearch/template/template';
import { installPipelines } from '../elasticsearch/ingest_pipeline/install';
import { installILMPolicy } from '../elasticsearch/ilm/install';
import { deleteAssetsByType, deleteKibanaSavedObjectsAssets } from './remove';
import { updateCurrentWriteIndices } from '../elasticsearch/template/template';
import { getRulesToInstall } from '../../../../../security_solution/server/lib/detection_engine/rules/get_rules_to_install';
import { getRulesToUpdate } from '../../../../../security_solution/server/lib/detection_engine/rules/get_rules_to_update';

export async function installLatestPackage(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgName: string;
  callCluster: CallESAsCurrentUser;
}): Promise<AssetReference[]> {
  const { savedObjectsClient, pkgName, callCluster } = options;
  try {
    const latestPackage = await Registry.fetchFindLatestPackage(pkgName);
    const pkgkey = Registry.pkgToPkgKey({
      name: latestPackage.name,
      version: latestPackage.version,
    });
    return installPackage({ savedObjectsClient, pkgkey, callCluster });
  } catch (err) {
    throw err;
  }
}

export async function ensureInstalledDefaultPackages(
  savedObjectsClient: SavedObjectsClientContract,
  callCluster: CallESAsCurrentUser
): Promise<Installation[]> {
  const installations = [];
  for (const pkgName in DefaultPackages) {
    if (!DefaultPackages.hasOwnProperty(pkgName)) continue;
    const installation = ensureInstalledPackage({
      savedObjectsClient,
      pkgName,
      callCluster,
    });
    installations.push(installation);
  }

  return Promise.all(installations);
}

export async function ensureInstalledPackage(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgName: string;
  callCluster: CallESAsCurrentUser;
}): Promise<Installation> {
  const { savedObjectsClient, pkgName, callCluster } = options;
  const installedPackage = await getInstallation({ savedObjectsClient, pkgName });
  if (installedPackage) {
    return installedPackage;
  }
  // if the requested packaged was not found to be installed, install
  await installLatestPackage({
    savedObjectsClient,
    pkgName,
    callCluster,
  });
  const installation = await getInstallation({ savedObjectsClient, pkgName });
  if (!installation) throw new Error(`could not get installation ${pkgName}`);
  return installation;
}

export async function installPackage(options: {
  savedObjectsClient: SavedObjectsClientContract;
  alertsClient: AlertsClient | undefined;
  pkgkey: string;
  callCluster: CallESAsCurrentUser;
}): Promise<AssetReference[]> {
  const { savedObjectsClient, pkgkey, callCluster, alertsClient } = options;
  console.log('Is alertsClient null?', alertsClient == null);
  console.log('I am here in installPackage with pkgkey:', pkgkey);
  // TODO: change epm API to /packageName/version so we don't need to do this
  const [pkgName, pkgVersion] = pkgkey.split('-');
  const paths = await Registry.getArchiveInfo(pkgName, pkgVersion);
  console.log('I am here in installPackage with pkgName, pkgVersion:', pkgName, pkgVersion);
  console.log('I am here in installPackage with paths:', paths);
  // see if some version of this package is already installed
  // TODO: calls to getInstallationObject, Registry.fetchInfo, and Registry.fetchFindLatestPackge
  // and be replaced by getPackageInfo after adjusting for it to not group/use archive assets
  const installedPkg = await getInstallationObject({ savedObjectsClient, pkgName });
  const registryPackageInfo = await Registry.fetchInfo(pkgName, pkgVersion);
  const latestPackage = await Registry.fetchFindLatestPackage(pkgName);

  if (pkgVersion < latestPackage.version)
    throw Boom.badRequest('Cannot install or update to an out-of-date package');

  const reinstall = pkgVersion === installedPkg?.attributes.version;
  const { internal = false, removable = true } = registryPackageInfo;

  // delete the previous version's installation's SO kibana assets before installing new ones
  // in case some assets were removed in the new version
  if (installedPkg) {
    console.log('Detected it was already installed, deleting assets installedPkg:', installedPkg);
    try {
      await deleteKibanaSavedObjectsAssets(savedObjectsClient, installedPkg.attributes.installed);
    } catch (err) {
      // log these errors, some assets may not exist if deleted during a failed update
    }
  }

  console.log('Installing Kibana assets is starting');
  const [installedKibanaAssets, installedPipelines] = await Promise.all([
    installKibanaAssets({
      savedObjectsClient,
      pkgName,
      pkgVersion,
      paths,
    }),
    installPipelines(registryPackageInfo, paths, callCluster),
    // index patterns and ilm policies are not currently associated with a particular package
    // so we do not save them in the package saved object state.
    installIndexPatterns(savedObjectsClient, pkgName, pkgVersion),
    // currenly only the base package has an ILM policy
    // at some point ILM policies can be installed/modified
    // per dataset and we should then save them
    installILMPolicy(paths, callCluster),
  ]);

  // install or update the templates
  console.log('Installing or updated templates');
  const installedTemplates = await installTemplates(
    registryPackageInfo,
    callCluster,
    pkgName,
    pkgVersion,
    paths
  );
  const toSaveESIndexPatterns = generateESIndexPatterns(registryPackageInfo.datasets);

  // get template refs to save
  const installedTemplateRefs = installedTemplates.map((template) => ({
    id: template.templateName,
    type: IngestAssetType.IndexTemplate,
  }));

  if (installedPkg) {
    // update current index for every index template created
    await updateCurrentWriteIndices(callCluster, installedTemplates);
    if (!reinstall) {
      try {
        // delete the previous version's installation's pipelines
        // this must happen after the template is updated
        await deleteAssetsByType({
          savedObjectsClient,
          callCluster,
          installedObjects: installedPkg.attributes.installed,
          assetType: ElasticsearchAssetType.ingestPipeline,
        });
      } catch (err) {
        throw new Error(err.message);
      }
    }
  }
  const toSaveAssetRefs: AssetReference[] = [
    ...installedKibanaAssets,
    ...installedPipelines,
    ...installedTemplateRefs,
  ];

  console.log('Installing security solutions rules');
  const [installedSecuritySolutionAssets] = await Promise.all([
    installSecuritySolutionAssets({
      alertsClient,
      savedObjectsClient,
      pkgName,
      pkgVersion,
      paths,
    }),
  ]);

  // Save references to installed assets in the package's saved object state
  return saveInstallationReferences({
    savedObjectsClient,
    pkgName,
    pkgVersion,
    internal,
    removable,
    toSaveAssetRefs,
    toSaveESIndexPatterns,
  });
}

// TODO: make it an exhaustive list
// e.g. switch statement with cases for each enum key returning `never` for default case
export async function installKibanaAssets(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgName: string;
  pkgVersion: string;
  paths: string[];
}) {
  const { savedObjectsClient, paths } = options;
  console.log('I am in the installKibanaAssets paths:', paths);

  // Only install Kibana assets during package installation.
  const kibanaAssetTypes = Object.values(KibanaAssetType);
  const installationPromises = kibanaAssetTypes.map(async (assetType) =>
    installKibanaSavedObjects({ savedObjectsClient, assetType, paths })
  );

  // installKibanaSavedObjects returns AssetReference[], so .map creates AssetReference[][]
  // call .flat to flatten into one dimensional array
  return Promise.all(installationPromises).then((results) => results.flat());
}

export async function installSecuritySolutionAssets(options: {
  savedObjectsClient: SavedObjectsClientContract;
  alertsClient: AlertsClient | undefined;
  pkgName: string;
  pkgVersion: string;
  paths: string[];
}) {
  const { alertsClient, pkgName, pkgVersion, paths } = options;
  console.log('I am here in the installSecuritySolutionAssets');
  if (alertsClient == null) {
    console.log('alertsClient is undefined or null, returning early');
  } else {
    // Only install Security assets during package installation.
    console.log('alertsClient is not null getting Object.values');
    const securityAssetTypes = Object.values(SecurityAssetType);
    console.log('I have securityAssetTypes now and am doing a map');
    const installationPromises = securityAssetTypes.map(async (assetType) => {
      console.log('I am here within the map about to installSecurityRules');
      installSecurityRules({ alertsClient, assetType, paths });
      console.log('I am done within the map and am done installingSecurityRules');
      const prepackagedRules = await getExistingPrepackagedRules({ alertsClient });
    });

    // installKibanaSavedObjects returns AssetReference[], so .map creates AssetReference[][]
    // call .flat to flatten into one dimensional array
    return Promise.all(installationPromises).then((results) => results.flat());

    console.log('alertsClient exists, I am going to call into it and begin working');
    console.log('I found these prepackagedRules here for you', prepackagedRules.length);
  }
}

export async function saveInstallationReferences(options: {
  savedObjectsClient: SavedObjectsClientContract;
  pkgName: string;
  pkgVersion: string;
  internal: boolean;
  removable: boolean;
  toSaveAssetRefs: AssetReference[];
  toSaveESIndexPatterns: Record<string, string>;
}) {
  const {
    savedObjectsClient,
    pkgName,
    pkgVersion,
    internal,
    removable,
    toSaveAssetRefs,
    toSaveESIndexPatterns,
  } = options;

  await savedObjectsClient.create<Installation>(
    PACKAGES_SAVED_OBJECT_TYPE,
    {
      installed: toSaveAssetRefs,
      es_index_patterns: toSaveESIndexPatterns,
      name: pkgName,
      version: pkgVersion,
      internal,
      removable,
    },
    { id: pkgName, overwrite: true }
  );

  return toSaveAssetRefs;
}

async function installKibanaSavedObjects({
  savedObjectsClient,
  assetType,
  paths,
}: {
  savedObjectsClient: SavedObjectsClientContract;
  assetType: KibanaAssetType;
  paths: string[];
}) {
  const isSameType = (path: string) => assetType === Registry.pathParts(path).type;
  const pathsOfType = paths.filter((path) => isSameType(path));
  const toBeSavedObjects = await Promise.all(pathsOfType.map(getObject));

  if (toBeSavedObjects.length === 0) {
    return [];
  } else {
    const createResults = await savedObjectsClient.bulkCreate(toBeSavedObjects, {
      overwrite: true,
    });
    const createdObjects = createResults.saved_objects;
    const installed = createdObjects.map(toAssetReference);
    return installed;
  }
}

function toAssetReference({ id, type }: SavedObject) {
  const reference: AssetReference = { id, type: type as KibanaAssetType };

  return reference;
}

async function installSecurityRules({
  alertsClient,
  assetType,
  paths,
}: {
  alertsClient: AlertsClient;
  assetType: SecurityAssetType;
  paths: string[];
}) {
  console.log('I am in installSecurityRules with paths:', paths, 'and assetType:', assetType);
  const isSameType = (path: string) => {
    console.log(
      'path is:',
      path,
      'assetType is:',
      assetType,
      'Registry.pathParts(path).type:',
      Registry.pathParts(path).type
    );
    return assetType === Registry.pathParts(path).type;
  };
  console.log('isSameType:', isSameType);
  const pathsOfType = paths.filter((path) => isSameType(path));
  console.log('pathsOfType:', pathsOfType);
  const ndjsonRulePaths = await Promise.all(pathsOfType.map(getRules));
  console.log('I have this ndjsonRules:', ndjsonRulePaths.length);
  ndjsonRulePaths.map(async (ndjsonRules) => {
    try {
      console.log('I have these ndjsonRules:', ndjsonRules.length);
      const rulesFromFileSystem = getPrepackagedRules(ndjsonRules);
      console.log('I have these rulesFromFileSystem:', rulesFromFileSystem.length);
      const prepackagedRules = await getExistingPrepackagedRules({ alertsClient });
      console.log('I have prepackagedRules:', prepackagedRules.length);
      const rulesToInstall = getRulesToInstall(rulesFromFileSystem, prepackagedRules);
      console.log('I have rulesToInstall:', rulesToInstall.length);
      const rulesToUpdate = getRulesToUpdate(rulesFromFileSystem, prepackagedRules);
      console.log('I have rulesToUpdate:', rulesToUpdate.length);
      const signalsIndex = '.siem-signals-hassanabad-frank-default';
      console.log('I am installing the rules');
      await Promise.all(installPrepackagedRules(alertsClient, rulesToInstall, signalsIndex));
      console.log('I am done installing the rules');
      console.log('Rules installed:', rulesToInstall.length);
      console.log('Rules updated:', rulesToUpdate.length);
    } catch (error) {
      console.log('Validation error of:', error);
    }
  });
  console.log('Sample zero of it is:', ndjsonRulePaths[0][0]);
  return;
  /*
  if (toBeSavedObjects.length === 0) {
    return [];
  } else {
    const createResults = await savedObjectsClient.bulkCreate(toBeSavedObjects, {
      overwrite: true,
    });
    const createdObjects = createResults.saved_objects;
    const installed = createdObjects.map(toAssetReference);
    return installed;
  }
  */
}
