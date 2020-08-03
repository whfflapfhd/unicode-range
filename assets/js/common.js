(function($) {
    var unicode = {
        checkError : function(){
            if(this.value == ""){
                alert('입력값이 없습니다');
                this.reset();
            }else if(this.type=="0" && !this.value.match(/U+/g)){
                alert('유효하지 않은 값입니다');
                this.reset();
            }else{
                (!this.type) ? this.makeText() : this.makeUnicode();
            }
        },
        makeText : function(){
            var _this = this;
            var arrayUnicode = _this.value.replace(/[U+.]/g,'').replace(/\s/g,'').toUpperCase().split(',');
            arrayUnicode.forEach(function(ele){
                if(ele.indexOf("-") > 0){
                    _this.getRange(ele)
                }else{
                    var str = _this.getUnicode(ele);
                    _this.result.push(str);
                }
            });
            this.result = this.result.join("");
            this.print();
        },
        makeUnicode : function(){
            var _this = this;
            var  arrayStr =_this.value.split("");
            arrayStr.forEach(function(ele){
                var str = ele.charCodeAt(0).toString(16).toUpperCase();
                while (str.length < 4) {
                  str = '0' + str;
                }
                _this.result.push("U+"+str);
            });
            this.result = this.result.join(", ");
            this.print()
        },
        makeUnicodeTable : function(type,idx){
            var tbl = $(".unicode-table tbody"),
            patten = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"],
            html = "",
            tdNode = "",
            btn = "<div class='unicode-select'><button type='button' class='single-select'>+</button><button type='button' class='multi-select'>~</button></div>",
            range = false;
            tbl.empty();
            for(var b=0; b<patten.length; b++){
                for(var c=0; c<patten.length; c++){
                    for(var d=0; d<patten.length; d++){
                        var code = idx +patten[b]+patten[c]+patten[d];
                        var codeTxt = this.getUnicode(code);
                        if(type === "ko"){
                            if(idx==="A"){
                                if(code === "AC00") range = true;
                                if(!range) continue;
                            }else if(idx==="D"){
                                if(Number("0x"+code) > 0xD7AF){
                                    codeTxt = "　";
                                    btn = "";
                                }
                            }
                        };
                        tdNode += "<td><div><p>" + code + "</p>" + btn + codeTxt + "</div></td>";
                        if(d == patten.length -1){
                            html += "<tr>"+tdNode+"</tr>";
                            tdNode = "";
                        };
                    };
                };
            };
            tbl.append(html);
            this.unicodeTdArray.all = tbl.find("td");
        },
        unicodeTdArray : {
            all : null,
            range : null
        },
        getUnicode : function(c){
            var c = Number("0x"+c);
            var d = String.fromCharCode(c);
            return d;
        },
        getRange : function(r){
            var r= r.split("-");
            var at = Number("0x"+r[0]);
            var until = Number("0x"+r[1]);
            for(var i = at;i < until+1; i++){
                var str = String.fromCharCode(i);
                this.result.push(str);
            }
        },
        print : function(){
            $(".output-area").html(this.result).addClass("on").selectText();
            //document.execCommand("copy");
        },
        reset : function(){
            $(".output-area").removeClass("on");
            $(".codeList").val("").focus();
            $(".example").find("span").removeClass("on").eq(Number($(".convert-type input:checked").val())).addClass("on")
        }
    };
    jQuery.fn.selectText = function(){
        var doc = document;
        var element = this[0];
        if (doc.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
     jQuery.fn.fixedScrollTop = function(){
         var obj = $(this),
               objOffset = obj.offset().top;
         $(window).on("scroll",function(){
            ($(this).scrollTop() >= objOffset) ? obj.addClass("fixedScrollTop") : obj.removeClass("fixedScrollTop");
         });
     };

    $(function(){
        /*폰트 테스트 페이지*/
        var  viewFonts = $(".previewer");
        var unit = ["px",""];
        var opt = [
            {
                animate: true, range : "min",
                value : 16, max : 44, min : 11,
                slide:function(event,ui){
                    viewFonts.css("font-size",ui.value + "px");
                    $(ui.handle).find("em").text(ui.value + unit[0])
                }
            },
            {
                animate: true, range : "min",
                value : 1.4, max : 3, min : 1, step : 0.1,
                slide:function(event,ui){
                    viewFonts.css("line-height",ui.value);
                    $(ui.handle).find("em").text(ui.value)
                }
            }
        ];
        var codeType = "ko";
        $(".slider").each(function(i){
            var handle = $(this).find(".ui-slider-handle em");
            $(this).slider(opt[i]);
            handle.text($(this).slider("value") + unit[i]);
        });
        $( "#radioset" ).buttonset();
        /*폰트 테스트 페이지 end*/

        /* Unicode Range 페이지*/
        var selectedSection = [];
        resultRange = [];
        /* Unicode Range 페이지 end*/

        $(document.body).on("click",".btnConvert",function(){
            unicode.result = [];
            unicode.type = Number($(".convert-type input:checked").val());
            unicode.value = $(".codeList").val();
            unicode.checkError();
        }).on("change",".convert-type input",unicode.reset).on("click",".range-type",function(){
            $(this).siblings(".range-type").removeClass("active").end().addClass("active");
            codeType = $(this).data("range");
        }).on("click",".range-tab ul button",function(){
            $(".range-tab ul button").removeClass("active")
            $(this).addClass("active");
            var rangeIndex = $(this).data("index");
            unicode.makeUnicodeTable(codeType,rangeIndex);

            resultRange = [];
            $(".unicode-range-result").text("").hide();
            $(window).scrollTop(0);
        }).on("change","input[name='weight']",function(){
            viewFonts.css("font-weight",$(this).val());
        }).on("click",".toggle-nav",function(){$(this).toggleClass("active")})
        .on("click",".unicode-select button",function(){
            var myParents= $(this).closest("td");
            var myClass = $(this).attr("class");
            if(myClass.indexOf("single-select") < 0 ){ // 다중 선택
                if(myParents.hasClass("selectedRange")){
                    var delCode = myParents.data("code");
                    printRange(delRange(delCode));                    
                    $("[data-code='"+delCode+"']").removeClass("selectedRange").removeAttr("data-code").find(".multi-select").removeClass("selected-del").text("~");;
                }else{
                    var idx = unicode.unicodeTdArray.all.index(myParents);
                    selectedSection.push(idx);
                    myParents.addClass("selected");
                    if(selectedSection.length > 1){
                        unicode.unicodeTdArray.range = unicode.unicodeTdArray.all.slice(selectedSection[0],selectedSection[1]+1);
                        printRange(addRange(unicode.unicodeTdArray.range.first().find("p").text().toLowerCase(),unicode.unicodeTdArray.range.last().find("p").text().toLowerCase()));
                        $.each(unicode.unicodeTdArray.range,function(a){
                            unicode.unicodeTdArray.range.eq(a).find(".multi-select").addClass("selected-del").text("x");
                            unicode.unicodeTdArray.range.eq(a).removeClass("selected").addClass("selectedRange").attr("data-code",resultRange[resultRange.length-1]);
                        });
                        selectedSection = [];
                        $(".unicode-table").find("td").removeClass("disabled");                    
                    }else{                    
                        for(var disabledTd = 0; disabledTd < idx; disabledTd++){                        
                            unicode.unicodeTdArray.all.eq(disabledTd).addClass("disabled");
                        }
                    }
                };                
            }else{ // 단일 선택
                if(myParents.hasClass("selected")){
                    printRange(delRange(myParents.find("p").text().toLowerCase()));
                    $(this).removeClass("selected-del").text("+");
                    myParents.removeClass("selected");
                }else{
                    printRange(addRange(myParents.find("p").text().toLowerCase()));
                    $(this).addClass("selected-del").text("x");
                    myParents.addClass("selected");
                }                
            };
            function printRange(fn){                
                (!fn) ? $(".unicode-range-result").hide() : $(".unicode-range-result").show();
                $(".unicode-range-result").text(fn).selectText();                
            };
            function addRange(t1,t2){
                var c = "U+"+t1;
                if(t2) c += "-"+t2;
                resultRange.push(c);
                return resultRange.join(",");
            };
            function delRange(t1){
                var c = (t1.indexOf("U") < 0 ) ? "U+"+t1 : t1;
                resultRange = resultRange.filter(function(item, pos, self) {
                    return item != c;
                 });
                 return resultRange.join(",");
            };
        });

        if($(".range-tab").length) $(".range-tab").fixedScrollTop();

    });
})(jQuery);

