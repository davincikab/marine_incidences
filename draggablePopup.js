let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<defs>
  <marker id="arrowhead" viewBox="0 0 10 10" refX="3" refY="5"
      markerWidth="6" markerHeight="6" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
</defs>
<g fill="none" stroke="black" stroke-width="2" marker-end="url(#arrowhead)">
  <path id="arrowLeft"/>
  <path id="arrowRight"/>
</g>
</svg>`;

function dragElement(popupContainer, elmnt, popupTip) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      console.log("Registering mousedown event");
      elmnt.onmousedown = dragMouseDown;
    }
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();

      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;

      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  
    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }

    // popupContainer.innerHTML += svg;
    // setTimeout(function(){
    //   drawConnector(popupContainer, elmnt, popupTip);
    // }, 500);
    
}



var drawConnector = function(popupContainer, divA, divB) {
  var arrowLeft  = popupContainer.querySelector("#arrowLeft");
  var arrowRight = popupContainer.querySelector("#arrowRight");

  var posnALeft = {
    x: divA.offsetLeft - 8,
    y: divA.offsetTop  + divA.offsetHeight / 2
  };

  var posnARight = {
    x: divA.offsetLeft + divA.offsetWidth + 8,
    y: divA.offsetTop  + divA.offsetHeight / 2    
  };

  var posnBLeft = {
    x: divB.offsetLeft - 8,
    y: divB.offsetTop  + divB.offsetHeight / 2
  };

  var posnBRight = {
    x: divB.offsetLeft + divB.offsetWidth + 8,
    y: divB.offsetTop  + divB.offsetHeight / 2
  };

  var dStrLeft =
      "M" +
      (posnALeft.x      ) + "," + (posnALeft.y) + " " +
      "C" +
      (posnALeft.x - 280) + "," + (posnALeft.y) + " " +
      (posnBLeft.x - 280) + "," + (posnBLeft.y) + " " +
      (posnBLeft.x      ) + "," + (posnBLeft.y);
  arrowLeft.setAttribute("d", dStrLeft);

  var dStrRight =
      "M" +
      (posnBRight.x      ) + "," + (posnBRight.y) + " " +
      "C" +
      (posnBRight.x + 280) + "," + (posnBRight.y) + " " +
      (posnARight.x + 280) + "," + (posnARight.y) + " " +
      (posnARight.x      ) + "," + (posnARight.y);

  arrowRight.setAttribute("d", dStrRight);
};



/* The setTimeout delay here is only required to prevent
 * the initial appearance of the arrows from being
 * incorrect due to the animated expansion of the
 * Stack Overflow code snippet results after clicking
 * "Run Code Snippet." If this was a simpler website,
 * a simple command, i.e. `drawConnector();` would suffice.
 */