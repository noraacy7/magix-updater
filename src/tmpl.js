var Tmpl_EscapeSlashRegExp = /\\|'/g;
var Tmpl_EscapeBreakReturnRegExp = /\r|\n/g;
var Tmpl_Mathcer = /<%([=!])?([\s\S]+?)%>|$/g;
var Tmpl_Compiler = function(text) {
  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "$p+='";
  text.replace(Tmpl_Mathcer, function(match, operate, content, offset) {
    source += text.slice(index, offset).replace(Tmpl_EscapeSlashRegExp, "\\$&").replace(Tmpl_EscapeBreakReturnRegExp, "\\n");
    index = offset + match.length;

    if (operate == "=") {
      source += "'+$e(" + content + ")+'";
    } else if (operate == "!") {
      source += "'+" + content + "+'";
    } else if (content) {
      source += "';" + content + "\n$p+='";
    }
    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';";

  // If a variable is not specified, place data values in local scope.
  //source = "with($mx){\n" + source + "}\n";
  source = "var $t,$p='',$em={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&#34;','\\'':'&#39;','`':'&#96;'},$er=/[&<>\"'`]/g,$ef=function(m){return $em[m]},$e=function(v){return (''+v).replace($er,$ef)},$um={'!':'%21','\\'':'%27','(':'%28',')':'%29','*':'%2A'},$uf=function(m){return $um[m]},$uq=/[!')(*]/g,$eu=function(v){return encodeURIComponent(v).replace($uq,$uf)},$qr=/[\\\\'\"]/g,$eq=function(v){return (''+v).replace($qr,'\\\\$&')};" + source + "return $p";
  /*jshint evil: true*/
  return Function("$$", source);
};
/**
 * Tmpl模板编译方法，该方法主要配合Updater存在
 * @name Tmpl
 * @beta
 * @module updater
 * @constructor
 * @param {String} text 模板字符串
 * @param {Object} data 数据对象
 * @example
 * // 主要配合updater使用
 * // html
 * // &lt;div mx-keys="a"&gt;&lt;%=a%&gt;&lt;/div&gt;
 * render:fucntion(){
 *   this.updater.set({
 *     a:1
 *   }).digest();
 * }
 * // 语法
 * // <% 语句块 %> <%= 转义输出 %> <%! 原始输出 %> <%@ view参数%>
 * // 示例
 * // <%for(var i=0;i<10;i++){%>
 * //   index:<%=i%>&lt;br /&gt;
 * //   &lt;div mx-view="path/to/view?index=<%@i%>"&gt;&lt;/div&gt;
 * // <%}%>
 *
 */
var Tmpl = function(text, data) {
  var fn = Tmpl_Compiler(text);
  return fn(data);
};