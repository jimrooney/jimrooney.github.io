// https://stackoverflow.com/questions/72071714/google-sheet-how-to-define-the-cols-label-value-in-json-export

const jsonString = `/*O_o*/
google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"1566616543","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"}],"rows":[{"c":[{"v":"Name"},{"v":"Age"}]},{"c":[{"v":"Vittorio"},{"v":"52"}]}],"parsedNumHeaders":0}});`
document.getElementById("json").innerHTML = myItems(jsonString.slice(47, -2))

  function myItems(jsonString) {
    var json = JSON.parse(jsonString);
    var table = '<table>';
    var flag = jsonWithLabels(json);
    if (flag) {
      table += '<tr>';
      json.table.cols.forEach(colonne => table += '<th>' + colonne.label + '</th>')
      table += '</tr>';
    }
    json.table.rows.forEach((row, index) => {
      table += '<tr>';
      row.c.forEach(cel => {
        try { var valeur = cel.f ? cel.f : cel.v }
        catch (e) { var valeur = '' }
        if (!flag && index == 0) { table += '<th>' + valeur + '</th>' }
        else { table += '<td>' + valeur + '</td>' }
      })
      table += '</tr>';
    })
    table += '</table>';
    return table
  }
  function jsonWithLabels(json) {
    var labels = json.table.cols.map(c => c.label);
    return (labels.join('') != '')
  }