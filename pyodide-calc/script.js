// Stop Plague.js
import {stopPlague} from 'https://cdn.jsdelivr.net/gh/sankalp6115/stopPlague@v1.0.0/stopPlague.js';
stopPlague();


  let pyodideReady = false;
  let pyodide;
  let mathFunctions = [];

  async function init() {
    pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");

    await pyodide.runPythonAsync(`
      import math
      from math import *
      globals().update(locals())
    `);

    pyodideReady = true;

    const fnList = await pyodide.runPythonAsync(`
[x for x in dir(math) if not x.startswith("_") and callable(getattr(math, x))]
`);
    mathFunctions = fnList.toJs();
    document.getElementById("help-functions").textContent = mathFunctions.join(", ");

    appendOutput(">>> ");
    updateVars();
  }

  init();

  const inputEl = document.getElementById("input");
  const outputEl = document.getElementById("output");
  const varsEl = document.getElementById("vars");

  inputEl.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = inputEl.value.trim();
      if (!code || !pyodideReady) return;

      appendInput(code);
      try {
        let result = await tryEval(code);
        if (result !== undefined) appendOutput(result);
      } catch (err) {
        appendError("Error", err);
      }

      inputEl.value = "";
      appendOutput(">>> ");
      updateVars();
    }
  });

  async function tryEval(code) {
    try {
      await pyodide.runPythonAsync(`__result = ${code}`);
      return await pyodide.runPythonAsync(`str(__result)`);
    } catch {
      await pyodide.runPythonAsync(code);
      return undefined;
    }
  }

  function appendInput(text) {
    outputEl.innerHTML += `<div class="input-line">>>> ${escapeHtml(text)}</div>`;
    scrollOutput();
  }

  function appendOutput(text) {
    if (text === undefined) return;
    outputEl.innerHTML += `<div class="output-line">${escapeHtml(text)}</div>`;
    scrollOutput();
  }

  function appendError(label, err) {
    const tooltip = escapeHtml(err.toString());
    outputEl.innerHTML += `<div class="error-line" title="${tooltip}">${label}</div>`;
    scrollOutput();
  }

  function scrollOutput() {
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function clearConsole() {
    outputEl.innerHTML = "Python 3 (Pyodide) on WebAssembly\n>>> ";
    inputEl.focus();
  }

  async function updateVars() {
    if (!pyodideReady) return;
    try {
      let names = await pyodide.runPythonAsync(`
[x for x in globals().keys()
 if not x.startswith("_")
 and not callable(globals()[x])
 and not x in dir(__builtins__)
 and not x in dir(math)
 and not isinstance(globals()[x], type(math))]
`);
      let varsHTML = "";
      for (let name of names.toJs()) {
        let val;
        try {
          val = await pyodide.runPythonAsync(`str(${name})`);
        } catch {
          val = "<unreadable>";
        }
        varsHTML += `<div><span class="var-name">${name}</span> = <span class="var-value">${escapeHtml(val)}</span></div>`;
      }
      varsEl.innerHTML = varsHTML || "(no user variables)";
    } catch (err) {
      varsEl.textContent = "Error loading vars";
    }
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }


// Help and Examples hiding
const functions = document.getElementById("help");
const helpArea = document.getElementById("examples");
let isVisible = false;
functions.style.display  = "none";
helpArea.style.display  = "none";
const helpBtn = document.getElementById("helpBtn");
helpBtn.addEventListener("click", function(){
    console.log(isVisible);
    if(!isVisible){
        isVisible = true;
        functions.style.display  = "block";
        helpArea.style.display  = "block";
    }
    else{
        isVisible = false;
        functions.style.display  = "none";
        helpArea.style.display  = "none";
    }
});