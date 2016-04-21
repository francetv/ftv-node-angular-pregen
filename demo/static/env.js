angular.module('config', [])
    .constant("env", {
        specificEnvValue: '{{SPECIFIC_ENV_VALUE}}'
    });
angular.module('resource.data', []).constant("serverData", {{&data}});