# kaholo-plugin-openshift
OpenShift API plugin for Kaholo.

## Settings
1. Cluster URL (String) **Optional** - The URL of the default cluster to connect to.
2. Username (String) **Optional** - The username of the default user to connect to. Can be a normal user(e.g. Bob, Alice), system user(e.g. system:admin, system:openshift-registry), or a Service Account(e.g. system:serviceaccount:default:deployer).
3. Password (Vault) **Optional** - The password of the default user to connect with.

## Method Apply
Create or update resources in your cluster. Update means that if resources with the same name as the ones specified, exist, they will be replaced by the newer version.

### Parameters
1. Cluster URL (String) **Optional** - The URL of the cluster to connect to.
2. Username (String) **Optional** - The username of the user to connect to. Can be a normal user(e.g. Bob, Alice), system user(e.g. system:admin, system:openshift-registry), or a Service Account(e.g. system:serviceaccount:default:deployer).
3. Password (Vault) **Optional** - The password of the user to connect with.
4. YML/JSON File Path (String) **Required** - Path to a YML/JSON file with info on the Kubernetes resources you want to create or update.
5. Namespace (string) **Optional** - The namespace to assign to all resources without namespaces specified. Default value is "default".

## Method Delete Object
Delete any kubernetes object(or multiple objects) by it's name, type and namespace.

### Parameters
1. Cluster URL (String) **Optional** - The URL of the cluster to connect to.
2. Username (String) **Optional** - The username of the user to connect to. Can be a normal user(e.g. Bob, Alice), system user(e.g. system:admin, system:openshift-registry), or a Service Account(e.g. system:serviceaccount:default:deployer).
3. Password (Vault) **Optional** - The password of the user to connect with.
4. Types (Text/Array) **Required** - The type(s) of object(s) you want to delete. You can enter multiple values by seperating each with a new line. You can see all available types in the file categories.json included in the sources directory of this repo.
5. Names (Text/Array) **Required** - The name(s) of the object(s) you want to delete. You can enter multiple values by seperating each with a new line.
6. Namespace (String) **Optional** - The namespace of the object(s) to delete. Default value is "default".


## Method List Objects
Get a list of all specified objects.

### Parameters
1. Cluster URL (String) **Optional** - The URL of the cluster to connect to.
2. Username (String) **Optional** - The username of the user to connect to. Can be a normal user(e.g. Bob, Alice), system user(e.g. system:admin, system:openshift-registry), or a Service Account(e.g. system:serviceaccount:default:deployer).
3. Password (Vault) **Optional** - The password of the user to connect with.
4. Category (Autocomplete) **Optional** - The category of the type of objects to list. Helps to filter unreleveant types. Not required and you can choose the type to list without chosing it's category.
5. Type (Autocomplete) **Required** - The type of the objects to return. 
6. Label Selectors(Text) **Optional** - If specified returns only objects with matching labels. You can see more on selectors [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/). You can enter multiple label selctors by seperating each with a new line. When specifying multuiple selectors, returned objects must match all selectors proided.
7. Field Selectors(Text) **Optional** - If specified returns only objects with matching fields. You can see more on selectors [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/). You can enter multiple field selctors by seperating each with a new line. When specifying multuiple selectors, returned objects must match all selectors proided.
8. Namespace (String) **Optional** - The namespace of the objects to list. Default value is "default".

## Method List Objects
Get information about the specified OpenShift object.

### Parameters
1. Cluster URL (String) **Optional** - The URL of the cluster to connect to.
2. Username (String) **Optional** - The username of the user to connect to. Can be a normal user(e.g. Bob, Alice), system user(e.g. system:admin, system:openshift-registry), or a Service Account(e.g. system:serviceaccount:default:deployer).
3. Password (Vault) **Optional** - The password of the user to connect with.
4. Category (Autocomplete) **Optional** - The category of the type of the object to get. Helps to filter unreleveant types. Not required and you can choose the type to list without chosing it's category.
5. Type (Autocomplete) **Required** - The type of the object to return. 
6. Name (String) **Required** - The name of the object to return. 
7. Namespace (String) **Optional** - The namespace of the object to return. Default value is "default".

