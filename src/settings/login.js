const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
} = require("../helpers/seafile-api");
const { getConfig, setConfig, retriveSeafileEnv, retrieveToken } = require("../helpers/addin-config");
const {UIStrings} = require("../helpers/UIString.js");

(function () {
  "use strict";
  // The Office initialize function must be run each time a new page is loaded.
  Office.initialize = function (reason) {
    jQuery(document).ready(function () {
      var myLanguage = Office.context.displayLanguage;

      var UIText;
      UIText = UIStrings.getLocaleStrings(myLanguage, "login");
      Object.keys(UIText).forEach(function(cssSelector){
        if (cssSelector == 'placeholder') {
          Object.keys(UIText[cssSelector]).forEach(function(key){
            $(key).attr('placeholder', UIText[cssSelector][key]);
          });
        } else {
          $(cssSelector).text(UIText[cssSelector]);
        }
        
      });


      var x, i, j, l, ll, selElmnt, a, b, c;
      /*look for any elements with the class "custom-select":*/
      x = document.getElementsByClassName("custom-select");
      l = x.length;
      for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        /*for each element, create a new DIV that will act as the selected item:*/
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /*for each element, create a new DIV that will contain the option list:*/
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 1; j < ll; j++) {
          /*for each option in the original select element,
          create a new DIV that will act as an option item:*/
          c = document.createElement("DIV");
          c.innerHTML = selElmnt.options[j].innerHTML;
          c.addEventListener("click", function(e) {
            /*when an item is clicked, update the original select box,
            and the selected item:*/
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
              if (s.options[i].innerHTML == this.innerHTML) {
                s.selectedIndex = i;
                h.innerHTML = this.innerHTML;
                y = this.parentNode.getElementsByClassName("same-as-selected");
                yl = y.length;
                for (k = 0; k < yl; k++) {
                y[k].removeAttribute("class");
                }
                this.setAttribute("class", "same-as-selected");
                membershipChange(i);
                break;
              }
            }
            h.click();
          });
          b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function(e) {
          /*when the select box is clicked, close any other select boxes,
          and open/close the current select box:*/
          e.stopPropagation();
          closeAllSelect(this);
          this.nextSibling.classList.toggle("select-hide");
          this.classList.toggle("select-arrow-active");
          this.parentElement.classList.toggle("select-active");
        });
      }
  
      function closeAllSelect(elmnt) {
        /*a function that will close all select boxes in the document,
        except the current select box:*/
        var x, y, i, xl, yl, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) {
          if (elmnt == y[i]) {
          arrNo.push(i)
          } else {
            y[i].classList.remove("select-arrow-active");
            y[i].parentElement.classList.remove("select-active");
          }
        }
        for (i = 0; i < xl; i++) {
          if (arrNo.indexOf(i)) {
          x[i].classList.add("select-hide");
          }
        }
      }
      /*if the user clicks anywhere outside the select box,
      then close all select boxes:*/
      document.addEventListener("click", closeAllSelect);
  
      function membershipChange(selectedIndex){
        switch (selectedIndex)
        {
          case 1:
            $('div.seafile_env').hide();
            
            $('#seafile_env').val("https://sync.luckycloud.de");
            break;
          case 2:
            $('div.seafile_env').hide();
            $('#seafile_env').val("https://storage.luckycloud.de");
            break;
          case 3:
            $('div.seafile_env').show();
            $('#seafile_env').val("");
            break;
          default:
            $('div.seafile_env').hide();
            $('#seafile_env').val("https://storage.luckycloud.de");
            break;
        }
      }

      $(".alert").hide();
      var validator = $("#regForm").validate({
        // Validate only visible fields
        ignore: ":hidden",
        highlight: function(element, errorClass, validClass) {
          let validflag = true;
          $('#regForm .error').each(function(){
            if ($(this).text() != '') {
              validflag = false; return false;
            }
          });
          if ( validflag )
            $('#seafile_loginbutton').addClass('active');
          else 
            $('#seafile_loginbutton').removeClass('active');
        },
        unhighlight: function(element, errorClass, validClass) {
          let validflag = true;
          $('#regForm .error').each(function(){
            if ($(this).text() != '') {
              validflag = false; return false;
            }
          });
          if ( validflag )
            $('#seafile_loginbutton').addClass('active');
          else 
            $('#seafile_loginbutton').removeClass('active');
        },
        // Validation rules
        rules: {
          membership_option : {
            required: true,
          },
          seafile_env: {
            required: true,
          },
          username: {
            required: true,
          },
          password: {
            required: true,
          },
        },
      });

      $(document).on('change','#membership_option', function(){
        var selected = $(this).val();

        if (selected == "home") {
          $('div.seafile_env').hide();
          $('#seafile_env').val("https://sync.luckycloud.de");
        } else if (selected == "business") {
          $('div.seafile_env').hide();
          $('#seafile_env').val("https://storage.luckycloud.de");
        } else if (selected == "enterprise") {
          $('div.seafile_env').show();
          $('#seafile_env').val("");
        }
      });

      $("#seafile_loginbutton").click(function () {
        if (validator && validator.form() !== true) return false;

        // disable button
        var btn = $(this);
        btn.prop("disabled", true);
        // add spinner to button
        btn.html(
          `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Wait a moment`
        );
        const env = $("#seafile_env").val();
        const username = $("#username").val();
        const password = $("#password").val();
        getToken($("#seafile_env").val(), $("#username").val(), $("#password").val(), function (config, error) {
          if (error) {

            btn.prop("disabled", false);
            $(".alert").hide();
            $(".alert-danger").show();
            btn.html(`<i class="login-background"></i>Log in`);

          } else {
            $(".alert").hide();
            $(".alert-success").show();
            Office.context.ui.messageParent(JSON.stringify(config));
            btn.prop("disabled", false);
            btn.html(`<i class="login-background"></i>Log in`);
          }
        });
      });
    });
  };
})();