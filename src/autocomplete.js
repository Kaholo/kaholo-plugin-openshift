const {categoryMaps, parseAutoComplete} = require("./helpers");

function paramsMapper(pluginSettings,actionParams){
  const settings = {};
  const params = {};

  if (pluginSettings && pluginSettings.length > 0) {
      pluginSettings.forEach(setting=>{
          settings[setting.name] = setting.value;
      })
  }

  if (actionParams && actionParams.length > 0) {
      actionParams.forEach(param=>{
          params[param.name] = param.value;
      })
  }

  return {settings, params};
}

async function getCategories(query, _, _){
  return Object.keys(categoryMaps)
    .filter(cat => query ? cat.toLowerCase().includes(query.toLowerCase()) : true)
    .sort(function(a, b){
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    })
    .map(cat => ({"id": cat, "value": cat}))
}

async function getTypes(query, pluginSettings, actionParams){
  const {settings, params} = paramsMapper(pluginSettings,actionParams);
  
  const categoryName = parseAutoComplete(params.category);
  let types;
  if (categoryName){
    types = Object.keys(categoryMaps[categoryName]);
  }
  else {
    types = Object.values(categoryMaps);
    types = types.map(category => Object.keys(category)).flat();
  }
  return types
    .filter(typeName => query ? typeName.toLowerCase().includes(query.toLowerCase()) : true)
    .sort(function(a, b){
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    })
    .map(typeName => ({"id": typeName, "value": typeName}));
}

module.exports = { 
  getCategories,
  getTypes
}