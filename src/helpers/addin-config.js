const encryptKey = (str) => {
  return btoa(str);
};

const decryptKey = (str) => {
  return atob(str);
};

export function getConfig() {
  var config = {};

  config.seafile_env = decryptKey(Office.context.roamingSettings.get("seafile_env"));
  config.seafile_username = decryptKey(Office.context.roamingSettings.get("seafile_username"));
  config.seafile_password = decryptKey(Office.context.roamingSettings.get("seafile_password"));
  config.seafile_token = decryptKey(Office.context.roamingSettings.get("seafile_token"));
  return config;
}

export function setConfig(config, callback) {
  Office.context.roamingSettings.set("seafile_env", encryptKey(config.seafile_env));
  Office.context.roamingSettings.set("seafile_username", encryptKey(config.seafile_username));
  Office.context.roamingSettings.set("seafile_password", encryptKey(config.seafile_password));
  Office.context.roamingSettings.set("seafile_token", encryptKey(config.seafile_token));
  Office.context.roamingSettings.saveAsync(callback);
}
export function retriveUserName(){
  return decryptKey(Office.context.roamingSettings.get("seafile_username"));
}
export function retriveSeafileEnv() {
  return decryptKey(Office.context.roamingSettings.get("seafile_env"));
}

export function retrieveToken() {
  return decryptKey(Office.context.roamingSettings.get("seafile_token"));
}

export function getDefaultPassword() {
  const password = Office.context.roamingSettings.get("default_password");
  if (password) return decryptKey(password);
  else return "";

}

export function setDefaultPassword(password = "", callback = function () {}) {
  Office.context.roamingSettings.set("default_password", encryptKey(password));
  Office.context.roamingSettings.saveAsync(callback);
}

export function getDefaultExpireDate() {
  const default_expire_date =  Office.context.roamingSettings.get("default_expire_date");
  if (default_expire_date) return decryptKey(default_expire_date);
  else return "";
}

export function setDefaultExpireDate(expire_date = "", callback = function () {}) {
  Office.context.roamingSettings.set("default_expire_date", encryptKey(expire_date));
  Office.context.roamingSettings.saveAsync(callback);
}


export function getEmailSetting(key = "" ){
  const option = Office.context.roamingSettings.get("email_setting");
  if (key) {
    if (option && option[key]) return option[key];
    else return "always_default";
  } else {
    return option;
  }
}
export function setEmailSetting(val = "", callback = function () {}) {
  // val = "always_default"
  Office.context.roamingSettings.set("email_setting", val);
  Office.context.roamingSettings.saveAsync(callback);
}

export function getShareOption(key = "") {
  const option = Office.context.roamingSettings.get("share_option");
  if (key !="") {
    if (option && option[key]) return option[key];
    else return "always_default";
  } else {
    return option;
  }
  // if (!option || option === undefined) return "always_default";
  // return option;
}
export function setShareOption(val = "", callback = function () {}) {
  // val = "always_default"
  Office.context.roamingSettings.set("share_option", val);
  Office.context.roamingSettings.saveAsync(callback);
}

export function getdownloadLinkOption() {
  const option = Office.context.roamingSettings.get("downloadlink_option");
  if (!option || option === undefined) return "1";
  return option;
}

export function setdownloadLinkOption(val = 1, callback = function () {}) {
  Office.context.roamingSettings.set("downloadlink_option", val);
  Office.context.roamingSettings.saveAsync(callback);
}


export function dataurltoFile(url, filename, mimeType){
  if (url.indexOf("base64") == -1) {
    url = `data:${mimeType};base64,${url}`;
  }
  return (fetch(url)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){return new File([buf], filename,{type:mimeType});})
  );
}

export function getDefaultAttachmentPath(){
  return {
    defaultLibraryname: Office.context.roamingSettings.get("defaultLibraryname") ? Office.context.roamingSettings.get("defaultLibraryname"): "",
    defaultPathname   :  Office.context.roamingSettings.get("defaultPathname") ? Office.context.roamingSettings.get("defaultPathname"): "",
    repo_id : Office.context.roamingSettings.get("repo_id") ? Office.context.roamingSettings.get("repo_id"): "",
  }  
}
export function setDefaultAttachmentPath(defaultLibraryname, defaultPathname = "/", repo_id, callback=function(){}){
  Office.context.roamingSettings.set("defaultLibraryname", defaultLibraryname);
  Office.context.roamingSettings.set("defaultPathname", defaultPathname);
  Office.context.roamingSettings.set("repo_id", repo_id);
  Office.context.roamingSettings.saveAsync(callback);
}

export function getLinkText(){
  return Office.context.roamingSettings.get("link_text")?Office.context.roamingSettings.get("link_text"): "Download Link";
}
export function setLinkText(text, callback=function(){} ) {
  Office.context.roamingSettings.set("link_text", text);
  Office.context.roamingSettings.saveAsync(callback);
}


export function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

