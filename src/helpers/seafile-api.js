export function getToken(env, user, password, callback) {
  $.ajax({
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      url: env + "/api2/auth-token/",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        username: user,
        password: password,
      },
    }),
  })
    .done(function (response) {

      if (response.token) {
        callback({
          seafile_env: env,
          seafile_username: user,
          seafile_password: password,
          seafile_token: response.token,
        });
      } else {
        callback(null, response);  
      }
    })
    .fail(function (error) {

      callback(null, error);
    });
}
export function getSeafileLibraries(token, env, callback) {
  $.ajax({
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      url: env + "/api2/repos/",
      method: "GET",
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; indent=4",
      },
    }),
  })
    .done(function (response) {
      if (callback) callback(response);
    })
    .fail(function (error) {

    });
}
export function getDirectoryDetail(token, env, repo, path, callback){
  if (path !="/") {
    if (path[path.length-1] !="/") path = path + "/";
  }
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: encodeURI(env + "/api/v2.1/repos/" + repo["id"] + "/dir/detail/" + (path !== "/" ? "?path=" + path : "")),
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; indent=4",
      },
    }),
  };

  $.ajax(settings)
  .done(function (response) {      
    if (callback) {
      callback(response);
    }
  })
  .fail(function (error) {

  });

}
export function getItemsInDirectory(token, env, repo, path, currentEnv, callback1, callback2=null) {

  if (path !="/") {
    if (path[path.length-1] !="/") path = path + "/";
  }
  var encodedPath = "";
  for (var i=0; i<path.length; i++) {
    if (path[i] !=='/') encodedPath = encodedPath + encodeURIComponent(path[i]);
    else encodedPath = encodedPath + path[i];
  }


  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: env + "/api2/repos/" + repo["id"] + "/dir/" + (path !== "/" ? "?p=" + encodedPath : ""),
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; indent=4",
        "Content-Type": "application/x-www-form-urlencoded"
      },
    }),
  };

  $.ajax(settings)
    .done(function (response) {    
      if (path.indexOf("testdir") >= 0)   {
        console.log(token);
        const uri_original  = env + "/api2/repos/" + repo["id"] + "/dir/" + (path !== "/" ? "?p=" + encodedPath : "");
        console.log('here is the path', path);
        console.log(uri_original);
        const uri_final = encodeURI(env + "/api2/repos/" + repo["id"] + "/dir/" + (path !== "/" ? "?p=" + encodedPath : ""));
        console.log(uri_final);
        console.log(response);
      }
      if (callback1) {
        if (callback2) callback1(repo, response, path, currentEnv, callback2);
        else callback1(repo, response, path, currentEnv);
      }
    })
    .fail(function (error) {      
      console.log('error while getting directory', error);
      
    });
}

export function getUploadLink(token, env, repo, path, callback) {
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: encodeURI(env + "/api2/repos/" + repo["id"] + "/upload-link/" + (path !== "/" ? "?p=" + path : "")),
      headers: {
        Authorization: "Token " + token,
      },
    }),
  };

  $.ajax(settings).done(function (response) {

    if (callback) callback(response);
  }).fail((err) => {

  });
}

export function uploadFile(token, env, uploadPath, relativePath,  selectedFile, callback) {
  var form = new FormData();
  form.append("file", selectedFile, selectedFile.name);
  form.append("parent_dir", relativePath);
  form.append("replace", "1");
  form.append("token", token);
  form.append("url", uploadPath);
  form.append("method", "GET");

  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: form,
  };

  $.ajax(settings).done(function (response) {
    if (callback) callback(response);
  }).fail((err) => {
    console.log('error while uploadFile');
  });;
}

export function downloadFile(token, env, repo, path, callback) {
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: encodeURI(env + "/api2/repos/" + repo["id"] + "/file/?p=" + path + "&reuse=1"),
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; charset=utf-8; indent=4",
      },
    }),
  };

  $.ajax(settings).done(function (response) {
    if (callback) callback(response);
  }).fail((err) => {

  });;
}

export function advancedDownloadFile(
  token,
  env,
  repo,
  path,
  filetype, 
  linkname, 
  password = null,
  expire_days = null,
  callback = function () {}
) {

  var body = {
    repo_id: repo.id,
    path: path,
    permissions: {
      can_download: true,
    },
  }
  if (password) body['password'] = password;
  if (expire_days) body['expire_days'] = expire_days;
  
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "POST",
      url: env + "/api/v2.1/share-links/",
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; charset=utf-8; indent=4",
        "Content-Type": "application/json",
      },
      body: body,
    }),
  };

  $.ajax(settings).done(function (response) {
    if (callback) callback(response);
  }).fail((err) => {

  });;
}

export function getSharedLink(token, env, repo, path, filetype, linkname,  callback) {

  var url = encodeURI(env + `/api/v2.1/share-links/?repo_id=${repo["id"]}&path=${path}`);

  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      // url: encodeURI(env + `/api/v2.1/share-links/?repo_id=${repo["id"]}&path=${encodeURIComponent(path)}`),
      url: encodeURI(env + `/api/v2.1/share-links/?repo_id=${repo["id"]}&path=${path}`),
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json",
      },
    }),
  };

  $.ajax(settings)
    .done(function (response) {
      if (callback) callback(response);
    })
    .fail((err) => {

      if (callback) callback([]);
    });
    
}