
const yaml = require('js-yaml');
const fs = require('fs');
const { getClient, parseResponse, parseAutoComplete, parseArr, parseSelector, getResource} = require("./helpers");
const { getCategories, getTypes} = require("./autocomplete");

async function apply(action, settings){
  const client = await getClient(action.params, settings);
  const filePath = (action.params.filePath || "").trim();
  const namespace = (action.params.namespace || "").trim();
  
  if (!filePath){
    throw "didn't provide file path!";
  }
  let specs;
  if (filePath.endsWith("json")){
    specs = require(filePath);
  }
  else if (filePath.endsWith("yml")){
    specs = yaml.loadAll(fs.readFileSync(filePath, 'utf8'));
  }
  else {
    throw "provided file path must be of types json or yml";
  }
  if (specs && !Array.isArray(specs)){
    specs = [specs];
  }
  if (!specs || specs.length === 0){
    throw "can't apply empty specs file";
  }
  const created = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const typeName = spec.kind;
    if (namespace && !spec.metadata.namespace && typeName !== "Namespace"){
      spec.metadata.namespace = namespace;
    }
    
    try {
      const res = await applyResource(client, typeName, spec, namespace);
      created.push(parseResponse(res));
    }
    catch (err) {
      created.push(parseResponse(err));
      throw created;
    }
  }
  return created;
}

async function deleteObject(action, settings){  
  const client = await getClient(action.params, settings);
  const namespace = (action.params.namespace || "default").trim();
  const types = parseArr(action.params.types);
  const names = parseArr(action.params.names);
  if (types.length < 1 || names.length < 1){
    throw "didn't provide all required parameters";
  }
  const [promises, deleted, failed]  = [[],[],[]]; // initiate with empty lists\
  types.forEach(typeName => {
    names.forEach(name => {
      promises.push(getResource(client, namespace, typeName, null, name).delete());
    });
  });
  const results = (await Promise.all(promises)); // remove all empty results
  results.forEach(deleteObj => {
    if (deleteObj.err){
      failed.push(parseResponse(deleteObj));
    }
    else {
      deleted.push(parseResponse(deleteObj));
    }
  });
  const returnVal = {deleted, failed};
  if (failed.length > 0 || deleted.length === 0){
    throw returnVal;
  }
  return returnVal;
}

async function listObjects(action, settings){
  const client = await getClient(action.params, settings);
  const namespace = (action.params.namespace || "default").trim();
  const category = parseAutoComplete(action.params.category);
  const resourceType = parseAutoComplete(action.params.type);
  const labelSelector = parseSelector(action.params.labelSelectors);
  const fieldSelector = parseSelector(action.params.fieldSelectors);
  if (!resourceType){
    throw "didn't provide resource type!"
  }

  const resource = getResource(client, namespace, resourceType, category);
  const query = {};
  if (labelSelector) query.labelSelector = labelSelector;
  if (fieldSelector) query.fieldSelector = fieldSelector;
  const getList = query ? resource.get({ qs: query }) : resource.get();
  return parseResponse(await getList);
}

async function getObject(action, settings){
  const client = await getClient(action.params, settings);
  const namespace = (action.params.namespace || "default").trim();
  const category = parseAutoComplete(action.params.category);
  const resourceType = parseAutoComplete(action.params.type);
  const name = (action.params.name || "").trim();
  if (!resourceType || !name){
    throw "didn't provide one of required parameters!"
  }

  const resource = getResource(client, namespace, resourceType, category, name);
  return parseResponse(await resource.get());
}

async function applyResource(client, typeName, spec, namespace){
  namespace = spec.metadata.namespace || namespace || "default";
  const resourceName = spec.metadata.name;
  let resource = getResource(client, namespace, typeName, null, resourceName);
  try {
    const res = await resource.get();
    return resource.patch({body: spec});
  }
  catch (err){
    resource = getResource(client, namespace, typeName);
    return resource.post({body: spec});
  }
}

module.exports = {
  apply,
  deleteObject,
  listObjects,
  getObject,
  // autocomplete
  getCategories,
  getTypes
};

