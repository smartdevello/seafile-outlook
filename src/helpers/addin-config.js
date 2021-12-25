
    export function getConfig() {
        var config = {};
    
        config.seafile_env = Office.context.roamingSettings.get('seafile_env');
        config.seafile_username = Office.context.roamingSettings.get('seafile_username');
        config.seafile_password = Office.context.roamingSettings.get('seafile_password');
        config.seafile_token = Office.context.roamingSettings.get('seafile_token');
        return config;
    }
    export function setConfig(config, callback) {

        Office.context.roamingSettings.set('seafile_env', config.seafile_env);
        Office.context.roamingSettings.set('seafile_username', config.seafile_username);
        Office.context.roamingSettings.set('seafile_password', config.seafile_password);
        Office.context.roamingSettings.set('seafile_token', config.seafile_token);
        Office.context.roamingSettings.saveAsync(callback);

    }
    export function retriveSeafileEnv(){
        return Office.context.roamingSettings.get('seafile_env');
    }
    export function retrieveToken(){
        return Office.context.roamingSettings.get('seafile_token');
    }
