const state = {
  page: "NAV1",
  gs: 90,
  directTo: null,
  flightPlan: ["KMFV","SWL","SBY","KESN"],
  cursor: false,
  selectedIndex: 0,
  lesson: 0,
  completed: new Set()
};

const pages = ["NAV1","NAV2","POS","FPL","MSG"];
const lessons = [
  {
    title: "Lesson 1: Find groundspeed",
    text: "Use the page selector or MODE button until the navigation page showing GS is displayed.",
    task: "Display a page containing groundspeed.",
    check: () => ["NAV1","NAV2"].includes(state.page),
    hint: "Select NAV 1 or NAV 2. The simulated GS field is on both navigation pages."
  },
  {
    title: "Lesson 2: Change navigation pages",
    text: "Use MODE to cycle through pages and stop on the position page.",
    task: "Display the POS page.",
    check: () => state.page === "POS",
    hint: "MODE advances one page at a time."
  },
  {
    title: "Lesson 3: Select an airport",
    text: "Press APT, rotate the knob until KESN is shown, then press ENT.",
    task: "Activate Direct-To KESN.",
    check: () => state.directTo === "KESN",
    hint: "APT opens the airport list. Rotate with the arrow controls, then press ENT."
  },
  {
    title: "Lesson 4: Review the flight plan",
    text: "Display the flight-plan page and use the knob to move through the route.",
    task: "Show FPL and highlight SBY.",
    check: () => state.page === "FPL" && state.selectedIndex === 2,
    hint: "Choose FPL from the page menu, then rotate the knob to index 2."
  },
  {
    title: "Lesson 5: Set a 3° descent rate",
    text: "Move groundspeed to 80 kt and note the displayed approximate vertical speed.",
    task: "Set GS to 80 kt.",
    check: () => state.gs === 80,
    hint: "Use the groundspeed slider below the trainer."
  }
];

const $ = id => document.getElementById(id);
const logEl = $("eventLog");

function addLog(text){
  const li = document.createElement("li");
  li.textContent = text;
  logEl.prepend(li);
}

function setPage(page, source="control"){
  state.page = page;
  $("pageSelect").value = page;
  state.cursor = false;
  render();
  addLog(`${source}: ${page} page selected.`);
  evaluateLesson();
}

function render(){
  const gs = state.gs.toString().padStart(3,"0");
  $("gsOut").textContent = `${state.gs} kt`;
  $("descentRate").textContent = Math.round(state.gs * 5.3);
  $("cursor").style.display = state.cursor ? "block" : "none";

  if(state.page === "NAV1"){
    $("screenStatus").textContent = state.directTo ? "DIRECT TO ACTIVE" : "ACTIVE LEG";
    $("screenMain").textContent = state.directTo ? `D→ ${state.directTo}` : "KMFV → KESN";
    $("screenData").textContent = "BRG 324°  DIS 43.2";
    $("screenData2").textContent = `GS ${gs}KT  ETE 0:29`;
  } else if(state.page === "NAV2"){
    $("screenStatus").textContent = "NAV DATA";
    $("screenMain").textContent = `TRK 319°  GS ${gs}KT`;
    $("screenData").textContent = "XTK 0.1L  BRG 324°";
    $("screenData2").textContent = "ETA 14:42  DIS 43.2";
  } else if(state.page === "POS"){
    $("screenStatus").textContent = "PRESENT POSITION";
    $("screenMain").textContent = "N37°38.8  W075°45.7";
    $("screenData").textContent = `TRK 319°  GS ${gs}KT`;
    $("screenData2").textContent = "GPS FIX 3D";
  } else if(state.page === "FPL"){
    $("screenStatus").textContent = "ACTIVE FLIGHT PLAN";
    $("screenMain").textContent = state.flightPlan.map((x,i)=>i===state.selectedIndex?`[${x}]`:x).join(" ");
    $("screenData").textContent = `LEG ${state.selectedIndex+1}/${state.flightPlan.length}`;
    $("screenData2").textContent = "ROTATE TO REVIEW";
  } else {
    $("screenStatus").textContent = "MESSAGES";
    $("screenMain").textContent = "NO ACTIVE WARNINGS";
    $("screenData").textContent = "DATABASE STATUS";
    $("screenData2").textContent = "VERIFY BEFORE IFR USE";
  }
}

function cyclePage(){
  const i = pages.indexOf(state.page);
  setPage(pages[(i+1)%pages.length],"MODE");
}

const airports = ["KMFV","KESN","KOXB","KCGS"];
let airportIndex = 0;
let selectingAirport = false;

function pressKey(key){
  document.querySelectorAll(`[data-key="${key}"]`).forEach(b=>{
    b.classList.add("active"); setTimeout(()=>b.classList.remove("active"),130);
  });

  if(key === "MODE") cyclePage();
  else if(key === "APT"){
    selectingAirport = true; airportIndex = 0; state.cursor = true;
    $("screenStatus").textContent = "SELECT AIRPORT";
    $("screenMain").textContent = airports[airportIndex];
    $("screenData").textContent = "ROTATE KNOB";
    $("screenData2").textContent = "ENT TO ACTIVATE D→";
    addLog("APT list opened.");
  } else if(key === "ENT"){
    if(selectingAirport){
      state.directTo = airports[airportIndex];
      selectingAirport = false;
      setPage("NAV1","ENT");
      addLog(`Direct-To ${state.directTo} activated.`);
    } else {
      addLog("ENT pressed.");
    }
  } else if(key === "CLR"){
    if(selectingAirport){ selectingAirport=false; state.cursor=false; render(); addLog("Selection cancelled."); }
    else if(state.directTo){ state.directTo=null; render(); addLog("Direct-To cancelled."); }
    else addLog("CLR pressed; nothing active to clear.");
  } else if(key === "HLD"){
    $("screenStatus").textContent = "HOLD MODE";
    $("screenMain").textContent = "COURSE HOLD ACTIVE";
    $("screenData").textContent = "PROCEDURAL MOCK-UP";
    $("screenData2").textContent = "VERIFY REAL UNIT";
    addLog("HLD mode selected.");
  } else if(key === "WRN" || key === "TCA"){
    setPage("MSG",key);
  } else if(key === "VOR"){
    $("screenStatus").textContent = "SELECT VOR";
    $("screenMain").textContent = "SBY  115.70";
    $("screenData").textContent = "SALISBURY";
    $("screenData2").textContent = "ENT TO SELECT";
    addLog("VOR database page opened.");
  } else if(key === "ARR"){
    $("screenStatus").textContent = "ARRIVAL DATA";
    $("screenMain").textContent = "KESN";
    $("screenData").textContent = "PROCEDURES LIMITED";
    $("screenData2").textContent = "CHECK INSTALLATION";
    addLog("Arrival page opened.");
  }
  evaluateLesson();
}

function rotate(dir){
  if(selectingAirport){
    airportIndex = (airportIndex + dir + airports.length) % airports.length;
    $("screenMain").textContent = airports[airportIndex];
    addLog(`Airport selector: ${airports[airportIndex]}.`);
  } else if(state.page === "FPL"){
    state.selectedIndex = (state.selectedIndex + dir + state.flightPlan.length) % state.flightPlan.length;
    render();
    addLog(`Flight-plan waypoint selected: ${state.flightPlan[state.selectedIndex]}.`);
  } else {
    addLog(`Knob rotated ${dir>0?"right":"left"}.`);
  }
  evaluateLesson();
}

function loadLesson(){
  const l = lessons[state.lesson];
  $("lessonTitle").textContent = l.title;
  $("lessonText").textContent = l.text;
  $("objective").innerHTML = `<strong>Task:</strong> ${l.task}`;
  $("progress").textContent = `${state.lesson+1} / ${lessons.length}`;
  $("feedback").textContent = "Awaiting input.";
  $("feedback").className = "feedback";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = state.lesson === lessons.length-1 ? "Finish" : "Next lesson";
  evaluateLesson();
}

function evaluateLesson(){
  const l = lessons[state.lesson];
  if(l.check()){
    state.completed.add(state.lesson);
    $("feedback").textContent = "Completed.";
    $("feedback").className = "feedback success";
    $("nextBtn").disabled = false;
  }
}

document.querySelectorAll("[data-key]").forEach(b=>b.addEventListener("click",()=>pressKey(b.dataset.key)));
$("knobLeft").addEventListener("click",()=>rotate(-1));
$("knobRight").addEventListener("click",()=>rotate(1));
$("knobPush").addEventListener("click",()=>pressKey("ENT"));
$("pageSelect").addEventListener("change",e=>setPage(e.target.value,"Page selector"));
$("gsSlider").addEventListener("input",e=>{
  state.gs = Number(e.target.value);
  render(); evaluateLesson();
});
$("hintBtn").addEventListener("click",()=>{
  $("feedback").textContent = lessons[state.lesson].hint;
  $("feedback").className = "feedback";
});
$("nextBtn").addEventListener("click",()=>{
  if(state.lesson < lessons.length-1){
    state.lesson++; loadLesson();
  } else {
    $("lessonTitle").textContent = "Course complete";
    $("lessonText").textContent = "You completed the five introductory exercises. Repeat them until the navigation data and basic workflows are familiar.";
    $("objective").innerHTML = "<strong>Next step:</strong> Compare every action with the actual installed unit and its approved documentation.";
    $("feedback").textContent = "Introductory familiarization complete.";
    $("feedback").className = "feedback success";
    $("nextBtn").disabled = true;
  }
});
$("resetAll").addEventListener("click",()=>{
  state.page="NAV1"; state.gs=90; state.directTo=null; state.selectedIndex=0; state.lesson=0;
  selectingAirport=false; airportIndex=0; state.completed.clear();
  $("gsSlider").value=90; render(); loadLesson(); addLog("Trainer reset.");
});

render();
loadLesson();
