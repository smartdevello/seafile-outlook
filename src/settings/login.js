const { getToken, getUploadLink, uploadFile, getItemsInDirectory, getSeafileLibraries, downloadFile } = require("../helpers/seafile-api");
const { getConfig, setConfig, retriveSeafileEnv, retrieveToken } = require("../helpers/addin-config");


(function(){
    'use strict';
    // The Office initialize function must be run each time a new page is loaded.
    Office.initialize = function(reason){
      jQuery(document).ready(function(){
        $(".alert").hide();
        var validator = $('#regForm').validate({
            // Validate only visible fields
            ignore: ":hidden",

            // Validation rules
            rules: {
                seafile_env: {
                    required: true,
                },
                username: {
                    required: true,
                },
                password : {
                    required: true,
                },
            }
        });
        $('#seafile_env').change(function(){
            console.log('changed');
        });
        $('#seafile_loginbutton').click(function(){
             if (validator && validator.form() !== true) return false;
            console.log('login button clicked');
            // disable button
            var btn = $(this);
            btn.prop("disabled", true);
            // add spinner to button
            btn.html(
                `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Wait a moment`
            );
            getToken($('#seafile_env').val(), $("#username").val(), $("#password").val(), function(config, error){
                if (error) {
                    console.log('error');
                    btn.prop("disabled", false);
                    btn.html(`Log in`);
                    $(".alert").hide();
                    $(".alert-danger").show();
                } else {
                    $(".alert").hide();
                    $(".alert-success").show();  
                    console.log(config);
                    Office.context.ui.messageParent(JSON.stringify(config));
                    btn.prop("disabled", false);
                    btn.html(`Log in`);
                }
            });
        });
      });
    };

    
 })();