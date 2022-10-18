const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
} = require("../helpers/seafile-api");
const {
  retrieveToken,
  retriveSeafileEnv,
  getShareOption,
  setShareOption,
  getEmailSetting,
  setEmailSetting,
  getDefaultPassword,
  setDefaultPassword,
  getDefaultExpireDate,
  setDefaultExpireDate,
  getdownloadLinkOption,
  setdownloadLinkOption,
  getDefaultAttachmentPath,
  setDefaultAttachmentPath,
  retriveUserName,
  getLinkText,
  setLinkText
} = require("../helpers/addin-config");
const {UIStrings} = require("../helpers/UIString.js");

// The Office initialize function must be run each time a new page is loaded.
var dirmap = {};
var propertymap = {};
var globalrepos = null;
  
Office.initialize = function (reason) {

    var token = retrieveToken();
    var env = retriveSeafileEnv();
	var username = retriveUserName();
	jQuery(document).ready(function(){

		var myLanguage = Office.context.displayLanguage;

		var UIText;
		UIText = UIStrings.getLocaleStrings(myLanguage, "setting");

		Object.keys(UIText).forEach(function(cssSelector){
			if (cssSelector == 'placeholder') {
			  Object.keys(UIText[cssSelector]).forEach(function(key){
				$(key).attr('placeholder', UIText[cssSelector][key]);
			  });
			} else {
			  $(cssSelector).text(UIText[cssSelector]);
			}
			
		  });

		jQuery('div.custom_green_white_select>div, div.custom_email_settings>div').click(function(){
			$(this).siblings().removeClass('active');
			$(this).addClass('active');
		});
		jQuery('div.custom_with_expire').click(function(){
			// $('div.custom_with_expire input').focus();
			// if ( $('div.custom_with_expire input').val() ) {
			// 	$('div.custom_with_expire span.expire-days').show();
			// } else $('div.custom_with_expire span.expire-days').hide();
		});


		$(".alert").hide();
		$(".ast").hide();
		$('.field-group button span.spinner-border').hide();
		var emailsetting = getEmailSetting();

		if ( typeof emailsetting !== 'object' ) {
			emailsetting = {};
		}

		////////////////////Password Settings///////////////////////////
		if (getEmailSetting("password")== "ask_every_time") {
			$('#password_content div.ask_every_time').addClass('active');
			emailsetting["password"] = "ask_every_time";
		} else {
			$('#password_content div.always_default').addClass('active');
			emailsetting["password"] = "always_default";
		}
  
		var defaultPassword = getDefaultPassword();
		if (defaultPassword) {
			$('.custom_with_password').addClass('active');
			$('div.custom_with_password input').val(defaultPassword);
		} else {
			$('.custom_without_password').addClass('active');
		}

		jQuery("button.update_password_settings").on("click", function(){
			defaultPassword = $('.custom_without_password').hasClass('active') ? "" : $('div.custom_with_password input').val();
			emailsetting["password"] = $('#password_content div.always_default').hasClass('active') ? "always_default" : "ask_every_time";
			if ($('div.custom_with_password').hasClass('active') && !defaultPassword ) {
				$('div.custom_with_password div.error span').show();
				return;
			}
			$('.update_password_settings').find('span.spinner-border').show();
			setDefaultPassword(defaultPassword, function(res){
				if (res.status == "succeeded") {					
					setEmailSetting( emailsetting, function(res){						
						if (res.status == "succeeded" ) {
							$('.update_password_settings').find('span.spinner-border').hide();
							$("#password_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#password_content .alert-success").slideUp(500);
							});
						}

					});

				}
			});
		});




		//////////////////////Expire date settings /////////////////////////
		var defaultExpireDate = getDefaultExpireDate();
		if (defaultExpireDate) {
			$('.custom_with_expire').addClass('active');
			$('.custom_with_expire input').val(defaultExpireDate);
		} else {
			$('.custom_without_expire_date').addClass('active');
		}
		if (getEmailSetting("expire_date")== "ask_every_time") {
			$('#expire_date_content div.ask_every_time').addClass('active');
			emailsetting["expire_date"] = "ask_every_time";
		} else {
			$('#expire_date_content div.always_default').addClass('active');
			emailsetting["expire_date"] = "always_default";
		}
		function isInt(value) {
			return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
		}
		jQuery("button.update_expire_date_settings").on("click", function(){
			defaultExpireDate = $('.custom_without_expire_date').hasClass('active') ? "" : $('div.custom_with_expire input').val();
			emailsetting["expire_date"] = $('#expire_date_content div.ask_every_time').hasClass('active') ? "ask_every_time" : "always_default";
			if ($('div.custom_with_expire').hasClass('active') && !defaultExpireDate) {
				$('div.custom_with_expire div.error span').text("*This field is required");
				$('div.custom_with_expire div.error span').show();
				return;
			}
			if ($('div.custom_with_expire').hasClass('active') && !isInt(defaultExpireDate) ) {
				$('div.custom_with_expire div.error span').text("*This field should be a numnber format");
				$('div.custom_with_expire div.error span').show();
				return;
			}

			$('.update_expire_date_settings').find('span.spinner-border').show();
			setDefaultExpireDate(defaultExpireDate, function(res){
				if (res.status == "succeeded") {					
					setEmailSetting( emailsetting, function(res){						
						if (res.status == "succeeded" ) {
							$('.update_expire_date_settings').find('span.spinner-border').hide();
							$("#expire_date_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#expire_date_content .alert-success").slideUp(500);
							});
						}
					});
				}
			});


		});


		///////////////////////Attachment Path Setting//////////////////////////
		var defaultAttachmentOption = getDefaultAttachmentPath();

        var currentAttachmentPath = "";
		if ( defaultAttachmentOption["defaultLibraryname"] && defaultAttachmentOption["defaultPathname"] ){
			currentAttachmentPath = "/" + defaultAttachmentOption["defaultLibraryname"] + defaultAttachmentOption["defaultPathname"];
			if (currentAttachmentPath[currentAttachmentPath.length-1] == "/") {
				currentAttachmentPath = currentAttachmentPath.substring(0, currentAttachmentPath.length - 1);
			}
		}
		$('.custom_with_path input').val(currentAttachmentPath);
		if ( !defaultAttachmentOption["defaultLibraryname"] || !defaultAttachmentOption["defaultPathname"] || !defaultAttachmentOption["repo_id"] ) {
			$('.custom_without_path').addClass("active");
		} else {
			$('.custom_with_path').addClass("active");
		}

		if (getEmailSetting("attachment_path")== "ask_every_time") {
			$('#attachment_path_content div.ask_every_time').addClass('active');
			emailsetting["attachment_path"] = "ask_every_time";
		} else {
			$('#attachment_path_content div.always_default').addClass('active');
			emailsetting["attachment_path"] = "always_default";
		}
		jQuery('div.custom_without_path').click(function(){
			$('.custom_with_path input').val("");
			$('div.filebrowser_container').hide();
		});

		jQuery("button.update_attachment_path_settings").on("click", function(){
			if ($('.custom_with_path').hasClass("active") && ( !defaultAttachmentOption["defaultLibraryname"] || !defaultAttachmentOption["defaultPathname"] || !defaultAttachmentOption["repo_id"] ) ){
				$('.custom_with_path div.error span').text("*You need to select a library&path");
				$('.filebrowser_container').css('margin-top', '50px');
				$('.custom_with_path div.error span').show();
				return;
			}
			emailsetting["attachment_path"] = $('#attachment_path_content div.ask_every_time').hasClass("active") ? "ask_every_time": "always_default";

			if ( $('.custom_without_path').hasClass("active") ) {
				defaultAttachmentOption = {
					defaultLibraryname : "",
					defaultPathname : "",
					repo_id : ""
				}
			}
			$('.update_attachment_path_settings').find('span.spinner-border').show();
			setDefaultAttachmentPath( defaultAttachmentOption["defaultLibraryname"] , defaultAttachmentOption["defaultPathname"], defaultAttachmentOption["repo_id"], function(res){
				if (res.status == "succeeded") {
					setEmailSetting( emailsetting, function(res){						
						if (res.status == "succeeded" ) {
							$('.update_attachment_path_settings').find('span.spinner-border').hide();
							$("#attachment_path_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#attachment_path_content .alert-success").slideUp(500);
							});
						}

					});
				}
			});
		});

		$('div.custom_green_white_select>div div.eye').click(function(){
			var $password_input = $('#password_content div.custom_green_white_select>div input');
			var type = $password_input.attr("type");
			if (type == "password") {
				$password_input.attr("type", "text");
			} else {
				$password_input.attr("type", "password");
			}
		});
		$('div.custom_with_path').click(function(){ 
			if ($('.ui-dialog').length == 0) {
				var browse = jQuery("#browser").dialog({
					appendTo: ".filebrowser_container",					
				});
				// $('.ui-dialog').appendTo('.filebrowser_container');
				// $("html, body").animate({ scrollTop: 0 }, "slow");
				// $(this).animate({ scrollTop: 200 }, "slow");
			} else {
				$('.ui-dialog').show();
				$('.filebrowser_container').show();
				return;
			}

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

			browse.browse({
			  root: "/",
			  separator: "/",
			  contextmenu: true,
			  username: username,
			  page_name: "settings",
			  menu: function (type) {
				if (type == "li") {
				//   return {
				// 	"Select As Default Path": function($li){


				// 	},
				//   };
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

			  },
			  selectDefaultPath: function($li){

				//Disable Button until the user select the path.
				$('#select_attachment_path').addClass('disabled')


				filename = $($li).find("span.name").text();
				path = browse.join(browse.path(), filename);
				repo = getRepofrompath(path);
				relativePath = getRelativepath(path + "/");
				$('div.custom_with_path input').val(path);
				defaultAttachmentOption["defaultLibraryname"] = repo.name;
				defaultAttachmentOption["defaultPathname"] = relativePath;
				defaultAttachmentOption["repo_id"]  = repo.id;

				$('.filebrowser_container').css('margin-top', '0px');
				$('.custom_with_path').find("div.error span").hide();
				// $('#defaultLibraryname').val(repo.name);
				// $('#defaultPathname').val(relativePath);
				// $('#repo_id').val(repo.id);

				//Enable the button and hide dialog
				$('#select_attachment_path').removeClass('disabled');
				$('.ui-dialog').toggle();
			  },
			  open: function ($li, filename) {
				var file = get(filename);
				if (typeof file == "string") {
				  console.log('file double clicked here');
	  
				} else {
				  throw new Error("Invalid filename");
				}
			  },
			  on_change: function () {
				$("#path").val(this.path());
			  },
			  refresh: function(path, callback) {
				console.log(path);
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
				  	getItemsInDirectory(token, env, repo, relativePath, get(path), refreshRepoMap, callback);
				  	$('.loader').hide();
				}
			  }
			});
		  }
  
		});


		///////////////////////Link Text Setting//////////////////////////
		var defaultdownloadLinkoption = getdownloadLinkOption();

		switch(defaultdownloadLinkoption) {
			case "1":
				$('#option_filename').prop("checked", true);
				break;
			case "2":
				$('#option_text').prop("checked", true);
				break;
			case "3":
				$('#option_text_filename').prop("checked", true);
				break;
			case "4":
				$('#option_text_link').prop("checked", true);
				break;
			default:
				$('#option_filename').prop("checked", true);
				break;
		}

		var link_text = getLinkText();
		
		$('.download_link_text input').val(link_text);
		$('.download_link_text input').on('keyup', function(){
			$('label.option_text span.text').text($(this).val());
			$('label.option_text_filename span.text').text($(this).val() + ": MyFile.docx");
			$('label.option_text_link span.text').text($(this).val() + ": https://sync.luckycloud.fe/f/198968e3e669473f8545/");

		});
		$('label.option_text span.text').text(link_text);
		$('label.option_text_filename span.text').text(link_text + ": MyFile.docx");
		$('label.option_text_link span.text').text(link_text + ": https://sync.luckycloud.fe/f/198968e3e669473f8545/");
		

		$('button.update_link_text_settings').on("click", function(){			
			if ( $('#option_filename').prop("checked") ) defaultdownloadLinkoption = "1";
			if ( $('#option_text').prop("checked") ) defaultdownloadLinkoption = "2";
			if ( $('#option_text_filename').prop("checked") ) defaultdownloadLinkoption = "3";
			if ( $('#option_text_link').prop("checked") ) defaultdownloadLinkoption = "4";
			link_text = $('.download_link_text input').val();
			$('button.update_link_text_settings span.spinner-border').show();
			setLinkText(link_text,  function(res){
				if (res.status == "succeeded") { 
					setdownloadLinkOption(defaultdownloadLinkoption, function(res){
						if (res.status == "succeeded") { 
							$('button.update_link_text_settings span.spinner-border').hide();	  
							$("#link_text_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#link_text_content .alert-success").slideUp(500);
							});
						}
					});
				}

				$(".ast").hide();
			});
		});



		$(".alert").hide();
		jQuery(".sidebar-item").click(function (event) {
			event.preventDefault();
			$(".sidebar-item").removeClass("active");
			$(this).addClass("active");
			var target = $(this).attr("data-target");
			$(".side-content").addClass("hide");
			$(`#${target}`).removeClass("hide");
		  });

	});

};
