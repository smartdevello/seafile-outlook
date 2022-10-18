const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
  advancedDownloadFile,
  getSharedLink,
  
} = require("../helpers/seafile-api");
const {
  retrieveToken,
  retriveSeafileEnv,
  getDefaultPassword,
  getShareOption,
  getEmailSetting,
  getDefaultExpireDate,
  retriveUserName
} = require("../helpers/addin-config");

// The Office initialize function must be run each time a new page is loaded.


Office.initialize = function (reason) {
  var token = retrieveToken();  var env = retriveSeafileEnv();  var username = retriveUserName();
  jQuery(document).ready(function () {
    var dirmap = {};
    var propertymap = {};

    var inputPrompt = document.createElement("iframe");
    inputPrompt.style.display = "none";
    document.body.appendChild(inputPrompt);
    window.prompt = inputPrompt.contentWindow.prompt;
    window.alert = inputPrompt.contentWindow.alert;

    var uploadFilebtn = document.getElementById("uploadFilebtn");
    var globalrepos = null;
    var browse = $("#browser").dialog({
      width: 600,
      height: 480,
    });

    uploadFilebtn.onchange = function (e) {
      if (uploadFilebtn.files.length > 0) {
        $(".loader").show();
        const selectedFile = uploadFilebtn.files[0];
        path = browse.path() + "/";
        repo = getRepofrompath(path);
        const relativePath = getRelativepath(path);

        getUploadLink(token, env, repo, relativePath, function (uploadPath) {
          uploadFile(token, env, uploadPath, relativePath, selectedFile, function (response) {
            $(".loader").hide();
            path = browse.join(browse.path(), selectedFile.name);
            browse.create("file", path);
          });
        });
      }
    };
    
    window.browse = browse;
    getSeafileLibraries(token, env, function (repos) {
      window.globalrepos = repos;
      globalrepos = repos;
      for (let repo of repos) {
        if ( repo.encrypted ) continue;
        dirmap[repo["name"]] = {};
        propertymap["/" + repo["name"]] = {
          owner : repo["owner"],
          size  : repo["size"],
          mtime : repo["mtime"]
        }
        getItemsInDirectory(token, env, repo, "/", dirmap[repo["name"]], initRepoMap);
      }
      $(".loader").hide();

      drawRootDirectory();
    });

    function initRepoMap(repo, detail, path, currentEnv) {
      if (!Array.isArray(detail)) return;
      for (let item of detail) {
        propertymap["/" + repo["name"] + path + item["name"]] = {
          owner : repo["owner"],
          size  :  item["size"],
          mtime : item["mtime"]
        }

        if (item.type == "dir") {
          currentEnv[item["name"]] = {};
          getItemsInDirectory(token, env, repo, path + item["name"] + "/", currentEnv[item["name"]], initRepoMap);
        } else {
          currentEnv[item["name"]] = "";
        }
      }
    }
    function refreshRepoMap(repo, detail, path, currentEnv, callback) {
      // Adds new direcotry/file to the currentEnv
      for (let item of detail) {
        propertymap["/" + repo["name"] + path + item["name"]] = {
          owner : repo["owner"],
          size  :  item["size"],
          mtime : item["mtime"]
        }

        if (typeof currentEnv[item["name"]] === "object" || typeof currentEnv[item["name"]] === "string") continue;
        if (item.type == "dir") {          
          currentEnv[item["name"]] = {};
        } else {
          currentEnv[item["name"]] = "";
        }
      }
      // Remove delted file or directory from currentEnv      
      for (key in currentEnv){
        let flag = false;
        for (let item of detail) {
          if (item["name"] == key) {
            flag = true; break;
          }
        }
        if (!flag) currentEnv[key] = undefined;
      }

      if (callback) callback();
    }
    function getRepofrompath(path) {
      path = path.substring(1);
			let reponame = "";
			if (path.indexOf("/") < 0)
				reponame = path;
			 else reponame= path.substring(0, path.indexOf("/"));
       
      for (let repo of globalrepos) {
        if (repo["name"] == reponame) return repo;
      }
    }

    function getRelativepath(path) {
      path = path.substring(1);
      if ( path.indexOf("/") < 0 ) return "/";
      return path.substring(path.indexOf("/"));
    }

    function drawRootDirectory() {
      function get(path) {
        var current = dirmap;
        browse.walk(path, function (file) {
          current = current[file];
        });
        return current;
      }

      function performDownload($li, dblclick) {
		    let  alertcnt = 0;
        var alertmessage = [];
        for (let i = 0; i< $li.length; i++) {			
		      const $element = $($li[i]);
		      // if ($element.hasClass("directory")) continue;

          const filename = $element.find("span.name").text();
          const filetype = $element.hasClass("directory") ? "d" : "f";
          const linkname = `${filename}${filetype == 'd' ? "/" : ""}`;
          path = browse.join(browse.path(), filename);
          repo = getRepofrompath(path);
  
          const relativePath = getRelativepath(path);
  
          var emailsetting = getEmailSetting();

          if ( typeof emailsetting !== 'object' ) {
            emailsetting = {};
          }


          var password = getDefaultPassword(), expire_days = getDefaultExpireDate();

          if (password &&  getEmailSetting("password") == "ask_every_time") {
            password = window.prompt("Please input password");
            if (!password) return;
          }
          if (expire_days && getEmailSetting("expire_date") == "ask_every_time") {
            expire_days = parseInt(window.prompt("Please input expire days", "10"));
            if (isNaN(expire_days)) return;
            if (expire_days <= 0) expire_days = null;
          }
 
          $(".loader").show();
           getSharedLink(token, env, repo, relativePath, filetype, linkname,  function (res) {
            currentPath = repo.name + relativePath;

            if (res.error_msg || res.length <= 0) {
              advancedDownloadFile(token, env, repo, relativePath, filetype, linkname,  password, expire_days, function (response) {
                $(".loader").hide();
                console.log(relativePath);
                if (response.error_msg) {

                  var errmsg = response.error_msg;
                  if ( errmsg.startsWith("Share link") ) {
                      var share_id = errmsg.split(" ")[2];
                      var message = {
                        downloadLink: `${env}/${filetype}/${share_id}`,
                        filename : linkname
                      }
                      alertmessage.push(`${filename} - A link already exists for this file, existing link has been inserted`);
                      if (dblclick) message.action = "close";
                      Office.context.ui.messageParent(
                        JSON.stringify(message)
                      );

                  } else {
                    alertmessage.push(`${filename} - ${response.error_msg}`);                    
                  }
                    
                } else {
                  alertmessage.push(`${filename} - A link has been inserted`);
                  if (relativePath == "/" ) currentPath = repo.name;

                  var message = {
                    downloadLink: response.link,
                    filename : linkname
                  }
					        if (dblclick) message.action = "close";
                  Office.context.ui.messageParent(
                    JSON.stringify(message)
                  );
                }

              });
            } else {
              alertmessage.push(`${filename} - A link already exists for this file, existing link has been inserted`);
              if (relativePath == "/" ) currentPath = repo.name;
              var message = {
                downloadLink: res[0].link,
                filename : linkname
              }
				      if (dblclick) message.action = "close";
              Office.context.ui.messageParent(
                JSON.stringify(message)
              );
              $(".loader").hide();
  
            }
          });

        }

        const myInterval = setInterval(checkdownloadCompleted, 500);
        function checkdownloadCompleted(){
          if (alertmessage.length == $li.length && !dblclick) {
            var message = "";
            alertmessage.forEach((msg)=>{ message = message + msg + "\n"; });
            window.alert(message);
            clearInterval(myInterval);
          } 
        }
      }
      browse.browse({
        root: "/",
        separator: "/",
        contextmenu: true,
        username: username,
        menu: function (type) {
          if (type == "li") {
            return {
              "Get Download Link": performDownload,
            };
          } else {
            return {
              "Upload File": function () {
                uploadFilebtn.click();
              },
            };
          }
        },
        dir: function (path) {
          return new Promise(function (resolve, reject) {
            dir = get(path);
            if ($.isPlainObject(dir)) {
              var result = {
                files: [],
                dirs: [],
              };
              Object.keys(dir).forEach(function (key) {
                const fullpath = ( path == "/" )? path + key : path + "/" + key;
                result[fullpath] = propertymap[fullpath];
                if (typeof dir[key] == "string") {
                  result.files.push(key);                  
                } else if ($.isPlainObject(dir[key])) {
                  result.dirs.push(key);
                }
              });
              resolve(result);
            } else {
              reject();
            }
          });
        },
        exists: function (path) {
          return typeof get(path) != "undefined";
        },
        error: function (message) {
          console.log(message);
        },
        create: function (type, path) {
          var m = path.match(/(.*)\/(.*)/);
          var parent = get(m[1]);
          if (type == "directory") {
            parent[m[2]] = {};
          } else {
            parent[m[2]] = "Content of new File";
          }
        },
        remove: function (path) {
          var m = path.match(/(.*)\/(.*)/);
          var parent = get(m[1]);
          delete parent[m[2]];
        },
        rename: function (src, dest) {
          var m = src.match(/(.*)\/(.*)/);
          var parent = get(m[1]);
          var content = parent[m[2]];
          delete parent[m[2]];
          parent[dest.replace(/.*\//, "")] = content;
        },
        downloadfrommenu: function($li){

          performDownload($li);
        },
        open: function ($li, filename) {
          var file = get(filename);
          if (typeof file == "string") {

            performDownload($li, true);

          } else {
            throw new Error("Invalid filename");
          }
        },
        on_change: function () {
          $("#path").val(this.path());
        },
        refresh: function(path, callback) {

          $('.loader').show();
          if (path == "/") {
            getSeafileLibraries(token, env, function (repos) {
              globalrepos = repos;
              // Adds new repo to dirmap 
              for (let repo of repos) {
                if ( repo.encrypted ) continue;
                if (typeof dirmap[repo["name"]] === 'object' || typeof dirmap[repo["name"]] === 'string') continue;
                dirmap[repo["name"]] = {}
                propertymap["/" + repo["name"]] = {
                  owner : repo["owner"],
                  size  :  repo["size"],
                  mtime : repo["mtime"]
                }
                getItemsInDirectory(token, env, repo, "/", dirmap[repo["name"]], refreshRepoMap);
              }
              // Remove deleted repos from dirmap
              for (let key in dirmap){
                let flag = false;
                for (let repo of repos) {
                  if (repo["name"] == key) { flag = true; break;}
                }
                if (!flag) dirmap[key] = undefined;
              }

              $('.loader').hide();
              if (callback) callback();

            });
          } else {
            if (path[path.length-1] !="/") path = path + "/";
            let repo = getRepofrompath(path);
            let relativePath = getRelativepath(path);
            let current_env = get(path);
            getItemsInDirectory(token, env, repo, relativePath, current_env, refreshRepoMap, callback);
            $('.loader').hide();
          }
        }
      });
    }
  });
};
