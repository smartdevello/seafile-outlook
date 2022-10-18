/* Store the locale-specific strings */

export var UIStrings = (function ()
{
    "use strict";

    var UIStrings = {};

    // JSON object for English strings
    UIStrings.EN =
    {
        "login" : {
            ".card-title span.green": "Log in",
            ".card-title span:not(.green)": " to luckycloud",
            '#membership_option option:first-child' : 'Your luckycloud product',
            '#membership_option option[value="home"]' : 'Home / Team',
            '#membership_option option[value="business"]': "Business",
            '#membership_option option[value="enterprise"]': "Enterprise",
            "placeholder" : {
                '#seafile_env' : 'Server address',
                '#username' : 'Your Email Address',
                '#password' : 'Password',

            },
            'div.alert-success' : 'You logged in successfully',
            'div.alert-danger' : 'Your credential is not incorrect, please try again',
            '#seafile_loginbutton span' : ' Log in '
        },
        "setting" : {
            'div.sidebar ul li:first-child a span.item' : 'Password',
            'div.sidebar ul li:nth-child(2) a span.item' : 'Expire date',
            'div.sidebar ul li:nth-child(3) a span.item' : 'Attachments Path',
            'div.sidebar ul li:nth-child(4) a span.item' : 'Link Text',
            '#password_content div.field-group:first-child h5.green': 'Default',
            '#password_content div.field-group:first-child h5:not(.green)' : 'password',
            'div.custom_without_password span' : ' without password ',
            'div.custom_with_password>span' : ' with password ',
            '#password_content div.error span' : '*This field is required',
            '#password_content div.field-group:nth-child(2) h5.green' : 'Set individual settings',
            '#password_content div.field-group:nth-child(2) h5:not(.green)' : 'for every email',
            'div.always_default span' : ' Always use default settings ',
            'div.ask_every_time span' : ' Ask every time ' ,
            '.alert-success strong' : 'Your settings has been saved successfully',
            'div.field-group button.apply span:not(.spinner-border)' : 'Apply',
            '#expire_date_content div.field-group:first-child h5.green': 'Default',
            '#expire_date_content div.field-group:first-child h5:not(.green)' : 'expire date',
            'div.custom_without_expire_date span' : ' without expire date',
            'div.custom_with_expire span.expire-desc' : ' with expire date',
            'div.custom_with_expire span.expire-days' : ' days',
            '#expire_date_content div.error span' : '*This field is required',
            '#expire_date_content div.field-group:nth-child(2) h5.green' : 'Set individual settings',
            '#expire_date_content div.field-group:nth-child(2) h5:not(.green)' : 'for every email',
            '#attachment_path_content div.field-group:first-child h5.green': 'Default',
            '#attachment_path_content div.field-group:first-child h5:not(.green)' : 'attachments library path',
            'div.custom_without_path span' : 'without default path',
            'div.custom_with_path>span' : 'select library & path',
            'div.custom_with_path div.error span' : '*You need to select a library&path',
            '#attachment_path_content div.field-group:nth-child(2) h5.green' : 'Set individual settings',
            '#attachment_path_content div.field-group:nth-child(2) h5:not(.green)' : 'for every email',
            '#link_text_content div.field-group:first-child h5.green': 'Default',
            '#link_text_content div.field-group:first-child h5:not(.green)' : 'link text',
            '#password_content p.byline' : 'Here you can set password for shared links',
            '#expire_date_content p.byline' : 'Here you can set expired date for shared links',
            '#attachment_path_content p.byline' : 'Here you can set a default path to upload attachment files',
            '#link_text_content p.byline' : 'Here you can set a link text format',
        },
        "filebrowser" : {
            'div.path-bar div.home' : ' My Cloud ',
            'div.content div.header span.name span' : 'Name',
            'div.content div.header span.owner span' : 'Owner',
            'div.content div.header span.mtime span' : 'Changed',
            'div.content div.header span.size span' : 'Size',
            "placeholder" : {
                'input.search-box' : 'Type text to search',
            },
        }

    };

    // JSON object for German strings
    UIStrings.DE =
    {
        "login" : {
            ".card-title span.green": "luckycloud",
            ".card-title span:not(.green)": " Login",
            '#membership_option option:first-child' : 'Dein luckycloud Produkt',
            '#membership_option option[value="home"]' : 'Home / Team',
            '#membership_option option[value="business"]': "Business",
            '#membership_option option[value="enterprise"]': "Enterprise",
            "placeholder" : {
                '#seafile_env' : 'Server Adresse',
                '#username' : 'Deine E-Mail Adresse',
                '#password' : 'Passwort',

            },
            'div.alert-success' : 'Login erfolgreich',
            'div.alert-danger' : 'Dein eingegebenes Passwort oder E-Mail Adresse ist falsch',
            '#seafile_loginbutton span' : ' Login '
        },
        "setting" : {
            'div.sidebar ul li:first-child a span.item' : 'Passwort',
            'div.sidebar ul li:nth-child(2) a span.item' : 'Ablaufdatum',
            'div.sidebar ul li:nth-child(3) a span.item' : 'Upload Pfad für E-Mail Anhänge',
            'div.sidebar ul li:nth-child(4) a span.item' : 'Link Text',
            '#password_content div.field-group:first-child h5.green': 'Default',
            '#password_content div.field-group:first-child h5:not(.green)' : 'Passwort',
            'div.custom_without_password span' : ' mit Passwort',
            'div.custom_with_password>span' : ' ohne Passwort ',
            '#password_content div.error span' : '*Diese Eingabe ist notwendig',
            '#password_content div.field-group:nth-child(2) h5.green' : 'Individuelle Einstellungen',
            '#password_content div.field-group:nth-child(2) h5:not(.green)' : 'für jede E-Mail',
            'div.always_default span' : ' Immer default Einstellungen nutzen',
            'div.ask_every_time span' : ' Jedes mal fragen ' ,
            '.alert-success strong' : 'Deine Einstellungen wurden erfolgreich gespeichert',
            'div.field-group button.apply span:not(.spinner-border)' : 'Speichern',
            '#expire_date_content div.field-group:first-child h5.green': 'Default',
            '#expire_date_content div.field-group:first-child h5:not(.green)' : 'Ablaufdatum',
            'div.custom_without_expire_date span' : ' ohne Ablaufdatum',
            'div.custom_with_expire span.expire-desc' : ' mit Ablaufdatum',
            'div.custom_with_expire span.expire-days' : ' days',
            '#expire_date_content div.error span' : '*Diese Eingabe ist notwendig',
            '#expire_date_content div.field-group:nth-child(2) h5.green' : 'Individuelle Einstellungen festlegen',
            '#expire_date_content div.field-group:nth-child(2) h5:not(.green)' : 'für jede E-Mail',
            '#attachment_path_content div.field-group:first-child h5.green': 'Default',
            '#attachment_path_content div.field-group:first-child h5:not(.green)' : 'Upload Pfad für E-Mail Anhänge',
            'div.custom_without_path span' : 'ohne default Pfad',
            'div.custom_with_path>span' : 'Bibliothek & Pfad auswählen',
            'div.custom_with_path div.error span' : '*Du musst eine Bibliothek & Pfad auswählen',
            '#attachment_path_content div.field-group:nth-child(2) h5.green' : 'Individuelle Einstellungen festlegen',
            '#attachment_path_content div.field-group:nth-child(2) h5:not(.green)' : 'für jede E-Mail',
            '#link_text_content div.field-group:first-child h5.green': 'Default',
            '#link_text_content div.field-group:first-child h5:not(.green)' : 'Link Text',
            '#password_content p.byline' : 'Here you can set password for shared links',
            '#expire_date_content p.byline' : 'Here you can set expired date for shared links',
            '#attachment_path_content p.byline' : 'Here you can set a default path to upload attachment files',
            '#link_text_content p.byline' : 'Here you can set a link text format',            
        },
        "filebrowser" : {
            'div.path-bar div.home' : ' Meine Cloud ',
            'div.content div.header span.name span' : 'Name',
            'div.content div.header span.owner span' : 'Eigentümer',
            'div.content div.header span.mtime span' : 'Geändert',
            'div.content div.header span.size span' : 'Größe',
            "placeholder" : {
                'input.search-box' : 'Type text to search',
            },
        }
    };

    UIStrings.getLocaleStrings = function (locale, page)
    {
        var text;

        // Get the resource strings that match the language.
        switch (locale)
        {
            case 'en-US':
                text = UIStrings.EN[page];
                break;
            case 'de-DE':
                text = UIStrings.DE[page];
                break;
            case 'de-LU':
                text = UIStrings.DE[page];
                break;
            case 'de-AT':
                text = UIStrings.DE[page];
                break;
            case 'de-CH':
                text = UIStrings.DE[page];
                break;
            default:
                text = UIStrings.EN[page];
                break;
        }

        return text;
    };

    return UIStrings;
})();