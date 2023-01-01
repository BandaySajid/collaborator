document.getElementById('editor').style.fontSize='17px';
var editor = ace.edit("editor", {
    mode: "ace/mode/javascript",
});

const textarea = document.querySelector('.ace_text-input');
editor.setValue(`   function collab(items) {
    let x = "collab with friend";
    return x;
}`);

textarea.addEventListener('keyup', sendData);

editor.setTheme("ace/theme/monokai");
                                                                         
editor.session.setMode("ace/mode/javascript");