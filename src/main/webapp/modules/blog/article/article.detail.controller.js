app.controller("ArticleDetailController", function ($scope, $routeParams,
                                                    ArticleService,MessageService) {
    setScreenAvailHeight();
    $scope.loadingPath=loading_path;
    $scope.loaded = false;
    $(function () {
        messageEditor = editormd("message-editormd", {
            width: "100%",
            height: 180,
            watch:false,
            path: web_project_name + "/plugins/editor.md/lib/",
            toolbarIcons: function () {
                return editormd.toolbarModes["mini"];
            },
            toolbar  : false,             //关闭工具栏
            saveHTMLToTextarea: true,
            lineNumbers:false,
            styleSelectedText:false,
            styleActiveLine:false,
            autoFocus:false,
            toolbarAutoFixed:false
        });
    });
    var messageEditor;
    //console.log($routeParams.articleTitle)
    $scope.get = function (articleTitle) {
        ArticleService.get(articleTitle).then(function (data) {
            //console.log(data);
            if(data.resultCody==0){
                $scope.error=true;
                $scope.errorMessage = "服务器错误";
            }else{
                if (data.resultData != null) {
                    //data.resultData.currentArticle.content = marked(data.resultData.currentArticle.content)
                    data.resultData.currentArticle.content = marked(data.resultData.currentArticle.content)
                    $scope.article = data.resultData.currentArticle;
                    $scope.preArticle = data.resultData.preArticle;
                    $scope.nextArticle = data.resultData.nextArticle;
                    $scope.error = false;
                    $scope.loaded =true;
                    MessageService.list($scope.article.id).then(function(data){
                        //console.log(data)
                        if(data.resultCode==0){
                            $scope.errorMessage = "服务器异常，没有获取到评论信息！"
                        }else{
                            $scope.messages = data.resultData;
                        }
                    })
                } else {
                    $scope.loaded = true;
                    $scope.error=true;
                    $scope.errorMessage = "文章不存在";
                }
            }
        });
    }

    $scope.comment = function(){

        //testEditor.getMarkdown();       // 获取 Markdown 源码
        //testEditor.getHTML();           // 获取 Textarea 保存的 HTML 源码
        //testEditor.getPreviewedHTML();  // 获取预览窗口里的 HTML，在开启 watch 且没有开启 saveHTMLToTextarea 时使用
        var message = messageEditor.getHTML();
        if(message.trim()==""){
            $scope.contentValidInfo = "请输入您的观点！";
            //$("#message-editormd").css("border-color","red");
            return false;
        }else{
            $scope.contentValidInfo = "谢谢您的发言！";
        }
        //console.log(message)
        //console.log($scope.guest);
        MessageService.comment($scope.guest,message,$scope.article.id).then(function(data){
            console.log(data)
            if(data.resultCode==0){
                $scope.resultMessage = data.resultMessage;
            }else{
                if(data.resultData==false){
                    $scope.resultMessage = data.resultMessage;
                }else{
                    messageEditor.setValue("");
                    //列出刚刚评论的信息
                    MessageService.list($scope.article.id).then(function(data){
                        if(data.resultCode==0){
                            $scope.errorMessage = "服务器异常，没有获取到评论信息！"
                        }else{
                            $scope.messages = data.resultData;
                            //message-body-top
                            $("html,body").animate({scrollTop: $("#message-body-top").offset().top}, 500);
                        }
                    })
                }

            }
        })
    }
    $scope.getGuestInfoByEmail = function (email) {
        //$("#message-editormd").css("border-color","#ddd");
        console.log(email);
        if(email==null || email.trim()==""){
            $scope.emailValidInfo ="邮箱不能为空"
            return false;
        }
        $scope.emailValidInfo ="OK，邮箱可用"
        MessageService.getGuestInfoByEmail(email).then(function(data){
            console.log(data);
            if(data.resultCode==1 && data.resultData!=null){
                $scope.nicknameValidInfo ="OK，您的昵称独一无二";
                $scope.guest =data.resultData;
            }else{
                $scope.guest.email =email;
            }
        });
    }
    $scope.getGuestInfoByNickname= function(email,nickname){
        if(email==null || email.trim()==""){
            $scope.nicknameValidInfo ="请先填写您的邮箱"
            return false;
        }
        console.log(nickname)
        if(nickname==null || nickname.trim()==""){
            $scope.nicknameValidInfo ="昵称不能为空"
            return false;
        }
        MessageService.getGuestInfoByNickname(email,nickname).then(function(data){
            console.log(data);
            if(data.resultCode==1){
                if(data.resultData){
                    $scope.nicknameValidInfo ="昵称已存在，请再想想";
                }else{
                    $scope.nicknameValidInfo ="OK，您的昵称独一无二";
                }
            }else{
                $scope.nicknameValidInfo ="服务器验证失败，请稍后再试";
            }
        });
    }
    // 获取文章信息
    $scope.get($routeParams.articleTitle);



});