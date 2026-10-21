/* Gespeichertes Farbschema sofort setzen (läuft im <head>, vor dem ersten Rendern -> kein Aufblitzen).
   Wert in localStorage 'bp_theme': "light" | "dark"; fehlt er (oder "auto"), folgt die Seite dem System. */
try{var t=JSON.parse(localStorage.getItem('bp_theme'));if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}
