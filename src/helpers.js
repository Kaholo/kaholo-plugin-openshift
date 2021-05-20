const ocRestClient = require('openshift-rest-client').OpenshiftClient;

function getClient(params, settings){
    const config = {
      url: params.clusterUrl || settings.clusterUrl,
      auth: {
        username: params.user || settings.user,
        password: params.password || settings.password
      },
      insecureSkipTlsVerify: true
    };
    return ocRestClient({config});
}

function parseResponse(res){
    if (res && res.body) return res.body;
    return res;
}

function parseAutoComplete(param){
    if (param && param.id) return param.id;
    return param;
}

function parseArr(param){
    if (!param) return [];
    if (Array.isArray(param)) return param;
    if (typeof(param) === "string"){
        return param.split("\n").map(line => line.trim()).filter(line => line);
    }
    throw "Provided param must be of type string/array!"
}

function parseSelector(param){
    const selectors = parseArr(param);
    return selectors.join(",");
}

function getResource(client, namespace, typeName, category, name){
    if (!category){
        category = Object.values(categoryMaps).find(cat => Object.keys(cat).includes(typeName));
        if (!category){
            throw `can't find type ${typeName}`;
        }
    }
    else if (!categoryMaps[category]){
        throw `Couldn't find category ${category}`;
    }
    else{
        
        if (!categoryMaps[category][typeName]){
            throw `can't find type ${typeName} in category ${category}`;
        }
        category = categoryMaps[category];
    }
    const typeData = category[typeName];
    const api = (typeData.api === 'core' ? client.api : client.apis[typeData.api])[typeData.version];
    const context = typeData.namespaced ? api.namespaces(namespace) : api;
    const func = context[typeData.typeName];
    return name ? func(name) : func;
}

const categoryMaps = {
    "Workload": {
        "BuildConfig": { api: 'build.openshift.io', version: 'v1', typeName: 'buildconfigs', namespaced: true},
        "Build":  { api: 'build.openshift.io', version: 'v1', typeName: 'builds', namespaced: true},
        "CronJob":  { api: 'batch', version: 'v1beta1', typeName: 'cronjobs', namespaced: true},
        "Daemon Set":  { api: 'apps', version: 'v1', typeName: 'daemonsets', namespaced: true},
        "Deployment":  { api: 'apps', version: 'v1', typeName: 'deployments', namespaced: true},
        "DeploymentConfig": { api: 'apps.openshift.io', version: 'v1', typeName: 'deploymentconfigs', namespaced: true},
        "Job":  { api: 'batch', version: 'v1', typeName: 'jobs', namespaced: true},
        "Pod":  { api: 'core', version: 'v1', typeName: 'pods', namespaced: true},
        "ReplicationController":  { api: 'core', version: 'v1', typeName: 'replicationcontrollers', namespaced: true},
        "ReplicaSet":  { api: 'apps', version: 'v1', typeName: 'replicasets', namespaced: true},
        "StatefulSet":  { api: 'apps', version: 'v1', typeName: 'statefulsets', namespaced: true},
        "PersistentVolume": { api: 'core', version: 'v1', typeName: 'persistentvolumes', namespaced: false}
    },
    "OpenShift User&Group": {
        "Group": { api: 'user.openshift.io', version: 'v1', typeName: 'groups', namespaced: false},
        "Identity": { api: 'user.openshift.io', version: 'v1', typeName: 'identities', namespaced: false},
        "UserIdentityMapping": { api: 'user.openshift.io', version: 'v1', typeName: 'useridentitymappings', namespaced: false},
        "User ": { api: 'user.openshift.io', version: 'v1', typeName: 'users', namespaced: false},
    },
    "Template": {
        "PodTemplate": { api: 'core', version: 'v1', typeName: 'podtemplates', namespaced: true},
        "TemplateInstance": { api: 'template.openshift.io', version: 'v1', typeName: 'templateinstances', namespaced: true},
        "BrokerTemplateInstance": { api: 'template.openshift.io', version: 'v1', typeName: 'brokertemplateinstances', namespaced: false},
    },
    "Storage": {
        "PersistentVolumeClaim": { api: 'core', version: 'v1', typeName: 'persistentvolumeclaims', namespaced: true},
        "VolumeSnapshot": { api: 'snapshot.storage.k8s.io', version: 'v1', typeName: 'volumesnapshots', namespaced: true},
        "VolumeAttachment": { api: 'storage.k8s.io', version: 'v1', typeName: 'volumeattachments', namespaced: false},
        "CSIDriver": { api: 'storage.k8s.io', version: 'v1', typeName: 'csidrivers', namespaced: false},
        "CSINode": { api: 'storage.k8s.io', version: 'v1', typeName: 'csinodes', namespaced: false},
        "StorageClass": { api: 'storage.k8s.io', version: 'v1', typeName: 'storageclasses', namespaced: false},
        "VolumeSnapshotClass": { api: 'snapshot.storage.k8s.io', version: 'v1', typeName: 'volumesnapshotclasses', namespaced: false},
        "VolumeSnapshotContent": { api: 'snapshot.storage.k8s.io', version: 'v1', typeName: 'volumesnapshotcontents', namespaced: false}
    },
    "Autoscale": {
        "MachineAutoscaler":  { api: 'autoscaling.openshift.io', version: 'v1beta1', typeName: 'machineautoscalers', namespaced: true},
        "HorizontalPodAutoscaler":  { api: 'autoscaling', version: 'v1', typeName: 'horizontalpodautoscalers', namespaced: true},
        "ClusterAutoscaler": { api: 'autoscaling.openshift.io', version: 'v1', typeName: 'clusterautoscalers', namespaced: false}
    },
    "Image": {
        "Image":  { api: 'image.openshift.io', version: 'v1', typeName: 'images', namespaced: false},
        "ImageSignature":  { api: 'image.openshift.io', version: 'v1', typeName: 'imagesignatures', namespaced: false},
        "ImageStream":  { api: 'image.openshift.io', version: 'v1', typeName: 'imagestreams', namespaced: true},
        "ImageStreamTag":  { api: 'image.openshift.io', version: 'v1', typeName: 'magestreamtags', namespaced: true},
        "ImageTag":  { api: 'image.openshift.io', version: 'v1', typeName: 'imagetags', namespaced: true}
    },
    "Machine": {
        "ContainerRuntimeConfig": { api: 'machineconfiguration.openshift.io', version: 'v1', typeName: 'containerruntimeconfigs', namespaced: false},
        "ControllerConfig": { api: 'machineconfiguration.openshift.io', version: 'v1', typeName: 'controllerconfigs', namespaced: false},
        "KubeletConfig": { api: 'machineconfiguration.openshift.io', version: 'v1', typeName: 'kubeletconfigs', namespaced: false},
        "MachineConfigPool": { api: 'machineconfiguration.openshift.io', version: 'v1', typeName: 'machineconfigpools', namespaced: false}, 
        "MachineConfig": { api: 'machineconfiguration.openshift.io', version: 'v1', typeName: 'machineconfigs', namespaced: false},
        "MachineHealthCheck":  { api: 'machine.openshift.io', version: 'v1beta1', typeName: 'machinehealthchecks', namespaced: true},
        "Machine":  { api: 'machine.openshift.io', version: 'v1beta1', typeName: 'machines', namespaced: true},
        "MachineSet":  { api: 'machine.openshift.io', version: 'v1beta1', typeName: 'machinesets', namespaced: true}
    },
    "Metadata": {
        "Namespace": { api: 'core', version: 'v1', typeName: 'namespaces', namespaced: false},
        "ConfigMap": { api: 'core', version: 'v1', typeName: 'configmaps', namespaced: true},
        "ControllerRevision": { api: 'core', version: 'v1', typeName: 'controllerrevisions', namespaced: true},
        "Event": { api: 'core', version: 'v1', typeName: 'events', namespaced: true},
        "Lease": { api: 'coordination.k8s.io', version: 'v1', typeName: 'leases', namespaced: true}
    },
    "Network": {
        "ClusterNetwork": { api: 'network.openshift.io', version: 'v1', typeName: 'clusternetworks', namespaced: false},
        "NetNamespace": { api: 'network.openshift.io', version: 'v1', typeName: 'netnamespaces', namespaced: false},
        "HostSubnet": { api: 'network.openshift.io', version: 'v1', typeName: 'hostsubnets', namespaced: false},
        "IngressClass": { api: 'networking.k8s.io', version: 'v1', typeName: 'ingressclasses', namespaced: false},
        "EndpointSlice": { api: 'discovery.k8s.io', version: 'v1beta1', typeName: 'endpointslices', namespaced: true},
        "Endpoints": { api: 'core', version: 'v1', typeName: 'endpoints', namespaced: true},
        "EgressNetworkPolicy": { api: 'network.openshift.io', version: 'v1', typeName: 'egressnetworkpolicies', namespaced: true},
        "Ingress": { api: 'networking.k8s.io', version: 'v1', typeName: 'ingresses', namespaced: true},
        "IPPool": { api: 'whereabouts.cni.cncf.io', version: 'v1alpha1', typeName: 'endpoints', namespaced: true},
        "NetworkPolicy": { api: 'networking.k8s.io', version: 'v1', typeName: 'networkpolicies', namespaced: true},
        "Route": { api: 'route.openshift.io', version: 'v1', typeName: 'routes', namespaced: true},
        "Service": { api: 'core', version: 'v1', typeName: 'services', namespaced: true},
    },
    "Node": {
        "Node": { api: 'core', version: 'v1', typeName: 'nodes', namespaced: false},
        "RuntimeClass": { api: 'node.k8s.io', version: 'v1', typeName: 'runtimeclasses', namespaced: false},
        "Profile": { api: 'tuned.openshift.io', version: 'v1', typeName: 'profiles', namespaced: true},
        "Tuned": { api: 'tuned.openshift.io', version: 'v1', typeName: 'tuneds', namespaced: true},
    },
    "Project": {
        "Project": { api: 'project.openshift.io', version: 'v1', typeName: 'projects', namespaced: false},
        "ProjectRequest": { api: 'project.openshift.io', version: 'v1', typeName: 'projectrequests', namespaced: false}
    },
    "Role": {
        "ClusterRoleBinding": { api: 'authorization.openshift.io', version: 'v1', typeName: 'clusterrolebindings', namespaced: false},
        "ClusterRole": { api: 'authorization.openshift.io', version: 'v1', typeName: 'clusterroles', namespaced: false},
        "RoleBindingRestriction": { api: 'authorization.openshift.io', version: 'v1', typeName: 'rolebindingrestrictions', namespaced: true},
        "RoleBinding": { api: 'authorization.openshift.io', version: 'v1', typeName: 'rolebindings', namespaced: true},
        "Role": { api: 'authorization.openshift.io', version: 'v1', typeName: 'roles', namespaced: true},
    },
    "Schedule&Quota": {
        "ClusterResourceQuota": { api: 'quota.openshift.io', version: 'v1', typeName: 'clusterresourcequotas', namespaced: false},
        "PriorityClass": { api: 'scheduling.k8s.io', version: 'v1', typeName: 'priorityclasses', namespaced: false},
        "AppliedClusterResourceQuota": { api: 'quota.openshift.io', version: 'v1', typeName: 'appliedclusterresourcequotas', namespaced: true},
        "LimitRange": { api: 'core', version: 'v1', typeName: 'limitranges', namespaced: true},
        "ResourceQuota": { api: 'core', version: 'v1', typeName: 'resourcequotas', namespaced: true},
    },
    "Security": {
        "CertificateSigningRequest": { api: 'certificates.k8s.io', version: 'v1', typeName: 'certificatesigningrequests', namespaced: false},
        "RangeAllocation": { api: 'security.openshift.io', version: 'v1', typeName: 'rangeallocations', namespaced: false},
        "SecurityContextConstraints": { api: 'security.openshift.io', version: 'v1', typeName: 'securitycontextconstraints', namespaced: false},
        "CredentialsRequest": { api: 'cloudcredential.openshift.io', version: 'v1', typeName: 'credentialsrequests', namespaced: true},
        "Secret": { api: 'core', version: 'v1', typeName: 'secrets', namespaced: true},
        "ServiceAccount": { api: 'core', version: 'v1', typeName: 'serviceaccounts', namespaced: true}
    }
}

module.exports = {
    getClient,
    parseResponse,
    parseAutoComplete,
    parseArr,
    parseSelector,
    getResource,
    categoryMaps
};
