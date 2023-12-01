window.onload = () => {



  // Select the body element
const body = document.querySelector("body");

// Set the content of the div
const textContent = `<div>
<span class="BlueBox"><a class="active" href="index.html">Home</a></span>
<span class="BlueBox"><a href="https://script.google.com/a/macros/jimrooney.com/s/AKfycbxoGRpmF6A06s8croIww3vvOPZnQbK0UG8IeQXilxSJm7TL2ZZR/exec">Logbook</a></span>

<span class="BlueBox"><a href="https://balance.jimrooney.com">Balance</a></span>
</div>`

body.insertAdjacentHTML("afterbegin", textContent)





// Insert the div at the beginning of the body
//body.insertBefore(div, body.firstChild);



  // document.body.innerHTML = <div>HI</div> // + document.body.innerHTML
  //  new ElementCollection(document.querySelector("body")).prepend(`<div>HI</div>`)
  //$("<body").prepend(

//   document.body.innerHTML =
//  + document.body.innerHTML
  
}
