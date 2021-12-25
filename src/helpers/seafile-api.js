import { retrieveToken, retriveSeafileEnv } from "./addin-config";
export function getToken(env, user, password, callback){
      $.ajax(
          {
              "url": "https://demo99.luckycloud-pro.de/addin/seafileAPI.php",
              "method": "POST",
              "timeout": 0,
              "headers": {
                "Content-Type": "application/json"
              },
              "data": JSON.stringify({
                "url": env + "/api2/auth-token/",
                "method" : "POST",
                "headers" : {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                "data": {
                  "username": user,
                  "password": password
                }
              })
            }
        ).done(function (response) {
          if (response.token) {
              callback({
                  "seafile_env" : env,
                  "seafile_username":user,
                  "seafile_password":password,
                  "seafile_token":response.token
              });            
          }
        }).fail(function(error){
              callback(null, error);
        });
  }
  export function getSeafileLibraries(callback){
    console.log('token in local stroage', localStorage.getItem('token'));

    let token = localStorage.getItem('token');
    let env = localStorage.getItem('env');
    if (token == null || env == null) {
      token = retrieveToken();
      env = retriveSeafileEnv();

      localStorage.setItem('token', token);
      localStorage.setItem('env', env);
    }

    
    $.ajax({
      "url": "https://demo99.luckycloud-pro.de/addin/seafileAPI.php",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({
        "url": env + "/api2/repos/",
        "method" : "GET",
        "headers" : {
          "Authorization": "Token " + token,
          "Accept": "application/json; indent=4",
        }
      })
    }).done(function (response) {
      if (callback) callback(response);
    }).fail(function (error){
      console.log(error);
    });
  }
  export function getItemsInDirectory(repo, path, currentEnv, callback) {
    let token = localStorage.getItem('token');
    let env = localStorage.getItem('env');
    if (token == null || env == null) {
      token = retrieveToken();
      env = retriveSeafileEnv();

      localStorage.setItem('token', token);
      localStorage.setItem('env', env);
    }

    var settings = {
      "url": "https://demo99.luckycloud-pro.de/addin/seafileAPI.php",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({
        "method": "GET",
        "url": env + "/api2/repos/" + repo['id'] + "/dir/" + (path !=="/" ? "?p=" + path: ""),
        "headers": {
          "Authorization": "Token " + token,
          "Accept": "application/json; indent=4"
        }
      }),
    };
    
    $.ajax(settings).done(function (response) {
      if (callback) callback(repo, response, path, currentEnv);
    });
  }

  export function getUploadLink(repo, path, callback) {
    let token = localStorage.getItem('token');
    let env = localStorage.getItem('env');
    if (token == null || env == null) {
      token = retrieveToken();
      env = retriveSeafileEnv();

      localStorage.setItem('token', token);
      localStorage.setItem('env', env);
    }
    var settings = {
      "url": "https://demo99.luckycloud-pro.de/addin/seafileAPI.php",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({
        "method": "GET",
        "url": env + "/api2/repos/" + repo['id'] +"/upload-link/" + (path !== '/' ? "?p=" + path: ""),
        "headers": {
          "Authorization": "Token " + token,
        }
      }),
    };
    
    $.ajax(settings).done(function (response) {
      console.log('upload Link', response);
      if (callback) callback(response);
    });
  }

  export function uploadFile(uploadPath, selectedFile, callback){

    let token = localStorage.getItem('token');
    let env = localStorage.getItem('env');
    if (token == null || env == null) {
      token = retrieveToken();
      env = retriveSeafileEnv();

      localStorage.setItem('token', token);
      localStorage.setItem('env', env);
    }


    var form = new FormData();
    form.append("file", selectedFile, selectedFile.name);
    form.append("parent_dir", "/");
    form.append("replace", "1");
    form.append("token", token);
    form.append("url", uploadPath);
    form.append("method", "GET");
    
    var settings = {
      "url": "https://demo99.luckycloud-pro.de/addin/seafileAPI.php",
      "method": "POST",
      "timeout": 0,
      "processData": false,
      "mimeType": "multipart/form-data",
      "contentType": false,
      "data": form
    };
    
    $.ajax(settings).done(function (response) {    
      if (callback) callback(response);
    });
  }

  export function downloadFile(repo, path, callback){
    let token = localStorage.getItem('token');
    let env = localStorage.getItem('env');
    if (token == null || env == null) {
      token = retrieveToken();
      env = retriveSeafileEnv();

      localStorage.setItem('token', token);
      localStorage.setItem('env', env);
    }

    var settings = {
      "url": "https://demo99.luckycloud-pro.de/addin/seafileAPI.php",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": JSON.stringify({
        "method": "GET",
        "url": env + "/api2/repos/" + repo['id'] + "/file/?p=" + path + "&reuse=1",
        "headers": {
          "Authorization": "Token " + token,
          "Accept": "application/json; charset=utf-8; indent=4"
        }
      }),
    };
    
    $.ajax(settings).done(function (response) {    
      if (callback) callback(response);
    });
  }
