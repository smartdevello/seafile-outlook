/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

const { getUploadLink, uploadFile, getToken } = require("../helpers/seafile-api");
const { getConfig, setConfig , getdownloadLinkOption,
   retrieveToken, retriveSeafileEnv ,
    dataurltoFile, getDefaultAttachmentPath, getShareOption,
    getEmailSetting,
    getLinkText, randomString
  } = require("../helpers/addin-config");

/* global global, Office, self, window */

var config;
var loginEvent, logoutEvent, downloadEvent, uploadEvent, settingsEvent, uploadAttachEvent;
var loginDialog, downloadDialog, uploadFileDialog, settingsDialog, selectAttachFolderDialog;

Office.onReady(() => {
  // If needed, Office.js is ready to be called
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
function uploadfileFromLocal(event) {
  config = getConfig();

  if (config && config.seafile_env) {
    loadUploadFilePage(event);
  } else {
    login(event);
  }
}

function downLoadfromServer(event) {
  config = getConfig();
  if (config && config.seafile_env) {
    loadDownloadDialog(event);
  } else {
    login(event);
  }
}

function login(event) {
  loginEvent = event;

  var url = new URI("login.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 25, height: 60, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    loginDialog = result.value;

    loginDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    loginDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

function logout(event){
  logoutEvent = event;
  setConfig(
    {
      seafile_env: "",
      seafile_username: "",
      seafile_password: "",
      seafile_token: "",
    }, function (result) {
      if (logoutEvent) {
        logoutEvent.completed();
        logoutEvent = null;
      }
  });


}
function loadUploadFilePage(event) {
  uploadEvent = event;

  var url = new URI("uploadFile.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 50, height: 55, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    uploadFileDialog = result.value;

    uploadFileDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    uploadFileDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);

  });

  
}

function loadDownloadDialog(event) {
  downloadEvent = event;

  var url = new URI("downLoadfile.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 60, height: 55, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    downloadDialog = result.value;

    downloadDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    downloadDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

// Adds text into the body of the item, then reports the results
// to the info bar.
function addTextToBody(text, icon, event) {
  Office.context.mailbox.item.body.setSelectedDataAsync(
    text + "<br>",
    { coercionType: Office.CoercionType.Html },
    function (asyncResult) {
      if (asyncResult.status == Office.AsyncResultStatus.Succeeded) {
        //Office.context.mailbox.item.body.setSelectedDataAsync("\r\n");
      } else {
        Office.context.mailbox.item.notificationMessages.addAsync("addTextError", {
          type: "errorMessage",
          message: 'Failed to insert "' + text + '": ' + asyncResult.error.message,
        });
      }
      if (event) event.completed();
    }
  );
}

function statusUpdate(icon, text) {
	try{
		Office.context.mailbox.item.notificationMessages.replaceAsync("status", {
			type: "informationalMessage",
			icon: 'seafile-icon-16x16',
			message: text,
			persistent: false,
		  }, function(res){

		  });
	}catch(error) {

	}
}

function addMessage(key, text, type="informationalMessage") {
  try{
    Office.context.mailbox.item.notificationMessages.addAsync(key, {
      type: type,
      icon: 'seafile-icon-16x16',
      message: text,
      persistent: false,
    }, function(res) {
      console.log(res);
    });
  }catch(error) {
    console.log(error);
  }

}

function receiveMessage(message) {
  message = JSON.parse(message.message);
  if (message && message.seafile_env) {
    setConfig(message, function (result) {
      loginDialog.close();
      loginDialog = null;
      loginEvent.completed();
      loginEvent = null;
    });
  } else if (message && message.downloadLink) {

    let  downloadLinkOption = getdownloadLinkOption();
    let link_text = getLinkText();
    let text = '';

    // while( message.filename.indexOf("/") >=0 ) {
    //   let pos = message.filename.indexOf("/");
    //   message.filename = message.filename.substring(pos + 1);
    // }

    if (downloadLinkOption == "1") {
      text = `<div><a href=${message.downloadLink}>${message.filename}</a></br></div>`
    } else if (downloadLinkOption == "2") {
      text = `<div><a href=${message.downloadLink}>${link_text}</a></br></div>`
    } else if (downloadLinkOption == "3") {
      text = `<div><a href=${message.downloadLink}>${link_text} : ${message.filename}</a></br></div>`
    } else {
      text = `<div><a href=${message.downloadLink}>${link_text} : ${message.downloadLink}</a></br></div>`
    }
    statusUpdate("attach-icon-16", "Link has been inserted.");
    setTimeout(() => {
      addTextToBody(text, "attach-icon-16");      
    }, 200);
    if (message.action == "close") dialogClosed();
  } else if (message && message.action == "uploadAttach" ) {
    selectAttachFolderDialog.close();
    selectAttachFolderDialog = null;
    uploadAttachmentFiles(Office.context.mailbox.item, {
      repo_id : message.repo_id,
      defaultPathname : message.defaultPathname
    });

  }  else {
    dialogClosed();
  }
}
function uploadAttachmentFiles(item, defaultAttachmentOption) {

	for (let i =0; i< item.attachments.length; i++) {
		const attachment  = item.attachments[i];
		// const attachmentType = attachment.attachmentType;
		const mimeType = attachment.contentType;
		const filename = attachment.name;
		const id = attachment.id;
		if (attachment.attachmentType == "file" ){
			// item.getAttachmentContentAsync(id, options, handleAttachmentsCallback)
			try{
				item.getAttachmentContentAsync(id, function(result){
							// Parse string to be a url, an .eml file, a base64-encoded string, or an .icalendar file.
					switch (result.value.format) {
						case Office.MailboxEnums.AttachmentContentFormat.Base64:
							// Handle file attachment.
							var token = retrieveToken();
							var env = retriveSeafileEnv();

							var repo = {};
							repo["id"] = defaultAttachmentOption.repo_id;
							relativePath = defaultAttachmentOption.defaultPathname;

							dataurltoFile(result.value.content, filename, mimeType).then(function(file){                
								getUploadLink(token, env, repo, relativePath, function(uploadPath) {
                  console.log(uploadPath);
									uploadFile(token, env, uploadPath, relativePath,  file, function (response) {
                    try{
                      response = JSON.parse(response);
                    }catch(parseError) {

                    }
                    var key = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    if (response && response.error == "Permission denied.") {                      
											addMessage(key, `Error, ${response.error} to your Path\n`);
										} else {
											addMessage(key, `Attachment files has been uploaded successfully\n`);
										}
										
										if ( i == item.attachments.length - 1) {
											if (uploadAttachEvent) {
												uploadAttachEvent.completed();
												uploadAttachEvent = null;
											}
										}

									});

								});
							});

							break;
						case Office.MailboxEnums.AttachmentContentFormat.Eml:
							// Handle email item attachment.
							break;
						case Office.MailboxEnums.AttachmentContentFormat.ICalendar:
							// Handle .icalender attachment.
							break;
						case Office.MailboxEnums.AttachmentContentFormat.Url:
							// Handle cloud attachment.
							break;
						default:
							// Handle attachment formats that are not supported.
					}
				});
			}catch(err){
        if (uploadAttachEvent) {
          uploadAttachEvent.completed();
          uploadAttachEvent = null;
        }
			}
		
		}

	}
}

function loadSettingsPage(event) {
  settingsEvent = event;

  var url = new URI("settings.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 48, height: 60, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    settingsDialog = result.value;

    settingsDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    settingsDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

function settingsPage(event) {
  config = getConfig();
  if (config && config.seafile_env) {
    loadSettingsPage(event);
  } else {
    login(event);
  }
}
function uploadAttachmentPage(event) {
  uploadAttachEvent = event;

    var item = Office.context.mailbox.item;

    const defaultAttachmentOption = getDefaultAttachmentPath();

	if (Office.context.requirements.isSetSupported('Mailbox', '1.8') && item.attachments.length > 0) {
		// defaultAttachmentOption.repo_id = undefined;
      
    	if (defaultAttachmentOption.repo_id && getEmailSetting("attachment_path") == "always_default")  {
			  uploadAttachmentFiles(item, defaultAttachmentOption);
    	} else {
        var config = getConfig();
        if (config && config.seafile_env) {
          var url = new URI("selectDefaultPath.html").absoluteTo(window.location).toString();
          var dialogOptions = { width: 50, height: 55, displayInIframe: true };

          Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
            selectAttachFolderDialog = result.value;
          
            selectAttachFolderDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
            selectAttachFolderDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
          });
        } else {
          login(event);
        }
      }
  }

  if (item.attachments.length == 0) {
    statusUpdate("attach-icon-16", "There is no attachment in this mail");
    uploadAttachEvent.completed();
    uploadAttachEvent = null;
  }


}
function dialogClosed(event) {

  if (loginDialog) {

    loginDialog.close();
    loginDialog = null;
  }
  if (loginEvent) {
    loginEvent.completed();
    loginEvent = null;
  }
  if (logoutEvent) {
    logoutEvent.completed();
    logoutEvent = null;
  }
  if (uploadFileDialog) {
    uploadFileDialog.close();
    uploadFileDialog = null;
  }
  if (uploadEvent) {
    uploadEvent.completed();
    uploadEvent = null;
  }
  if (downloadDialog) {
    downloadDialog.close();
    downloadDialog = null;
  }
  if (downloadEvent) {
    downloadEvent.completed();
    downloadEvent = null;
  }

  if (settingsDialog) {
    settingsDialog.close();
    settingsDialog = null;
  }
  if (settingsEvent) {
    settingsEvent.completed();
    settingsEvent = null;
  }

  if (selectAttachFolderDialog) {
    selectAttachFolderDialog.close();
    selectAttachFolderDialog = null;	
  }
  if (uploadAttachEvent) {
    uploadAttachEvent.completed();
    uploadAttachEvent = null;
  }
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

var g = getGlobal();

// The add-in command functions need to be available in global scope
g.uploadfileFromLocal = uploadfileFromLocal;
g.downLoadfromServer = downLoadfromServer;
g.login = login;
g.settingsPage = settingsPage;
g.logout = logout;

g.uploadAttachmentPage = uploadAttachmentPage;