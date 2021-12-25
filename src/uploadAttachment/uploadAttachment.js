const {getUploadLink, uploadFile, getItemsInDirectory, getSeafileLibraries} = require("../helpers/seafile-api");

// The Office initialize function must be run each time a new page is loaded.
Office.initialize = function(reason){
    
    jQuery(document).ready(function(){
        var env = {};
        var uploadFilebtn = document.getElementById('uploadFilebtn');
        var globalrepos = null;
        var browse = $('#browser').dialog({
            width: 600,
            height: 480
        });
        uploadFilebtn.onchange = function(e) {

            if (uploadFilebtn.files.length > 0) {
                $('.loader').show();
                const selectedFile = uploadFilebtn.files[0];
                path = browse.path() + "/";
                repo = getRepofrompath(path);                                        
                relativePath = getRelativepath(path);

                getUploadLink(repo, relativePath, function(uploadPath){
                    uploadFile(uploadPath, selectedFile, function(response){
                        $('.loader').hide();
                        path = browse.join(browse.path(), selectedFile.name);
                        browse.create('file', path);
                    });
                });

            }
        };
        getSeafileLibraries(function(repos){
            token = localStorage.getItem('token');
            $('.error').text(token);
            globalrepos = repos;
            for (repo of repos) {
                env[repo['name']] = {};

                getItemsInDirectory ( repo, "/", env[repo['name']], initRepoMap);
                
            }
            $('.loader').hide();
            drawRootDirectory();
        });
        function initRepoMap(repo, detail, path, currentEnv){

            for (item of detail){
                if (item.type == 'dir') {
                    currentEnv[item['name']] = {};
                    getItemsInDirectory(repo, path + item['name'] + "/", currentEnv[item['name']], initRepoMap);
                } else {
                    currentEnv[item['name']] = '';
                }
                
            }
            
        };
        function getRepofrompath(path) {
            path = path.substring(1);
            let reponame = path.substring(0, path.indexOf('/'));
            for (repo of globalrepos) {
                if (repo['name'] == reponame) return repo;
            }
        }
        function getRelativepath(path) {
            path = path.substring(1);
            return path.substring(path.indexOf('/'));

        }
        function drawRootDirectory(){
            function get(path) {
                var current = env;
                browse.walk(path, function(file) {
                    current = current[file];
                });
                return current;
            }


            browse.browse({
                root: '/',
                separator: '/',
                contextmenu: true,
                menu: function(type) {
    
                    if (type == 'li') {
                        return {
                            // 'Get Download Link': function($li) {    
                                
                            //     console.log($li);
                            //     filename = $li.find('span').text();
                            //     path = browse.join(browse.path(), filename);
                            //     console.log('path', path);     
                            //     repo = getRepofrompath(path);                                        
                            //     console.log('repo ', repo);
                            //     relativePath = getRelativepath(path);
                            //     console.log('realative Path', relativePath);
                            //     downloadFile(repo, relativePath,  function(link){
                            //         console.log('Download Link', link);
                            //         $('#downloadLink').text(link);
                            //         $('#downloadLink').attr("href", link);
                            //         $('#downloadLink').css('display', 'block');
                            //     });
                            // },
    
                        };
                    }  else {
                        return {
                            'Upload File': function() {
                                uploadFilebtn.click();                                   
                            }
                        };


                    }
                },
                dir: function(path) {

                    return new Promise(function(resolve, reject) {
                        dir = get(path);
                        if ($.isPlainObject(dir)) {
                            var result = {files:[], dirs: []};
                            Object.keys(dir).forEach(function(key) {
                                if (typeof dir[key] == 'string') {
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
                exists: function(path) {
                    return typeof get(path) != 'undefined';
                },
                error: function(message) {

                },
                create: function(type, path) {                       
                    var m = path.match(/(.*)\/(.*)/);
                    var parent = get(m[1]);
                    if (type == 'directory') {
                        parent[m[2]] = {};
                    } else {
                        parent[m[2]] = 'Content of new File';
                    }
                },
                remove: function(path) {
                    var m = path.match(/(.*)\/(.*)/);
                    var parent = get(m[1]);
                    delete parent[m[2]];
                },
                rename: function(src, dest) {
                    var m = src.match(/(.*)\/(.*)/);
                    var parent = get(m[1]);
                    var content = parent[m[2]];
                    delete parent[m[2]];
                    parent[dest.replace(/.*\//, '')] = content;
                },
                open: function(filename) {
                    var file = get(filename);

                    if (typeof file == 'string') {

                    } else {
                        throw new Error('Invalid filename');
                    }
                },
                on_change: function() {
                    $('#path').val(this.path());
                }
            });
        }

        function checkDirectoryConfigured(path){
            let currentEnv = env;
            path = path.substring(1);

            while (path.length) {                
                pos = path.indexOf('/');
                dir = path.substring(0, pos);
                currentEnv = currentEnv[dir];

            }

        }
    });

};