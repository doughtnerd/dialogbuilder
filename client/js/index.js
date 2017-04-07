"use strict";

var Panel = ReactBootstrap.Panel,
    Accordion = ReactBootstrap.Accordion;
var Button = ReactBootstrap.Button,
    Input = ReactBootstrap.Input;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var Modal = ReactBootstrap.Modal;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var ListGroup = ReactBootstrap.ListGroup,
    ListGroupItem = ReactBootstrap.ListGroupItem;

var urls = {
  post: "./dialogs/submit",
  get: "./dialogs/retrieve",
  format: "./dialogs/format",
  put: "",
  delete: ""
};

function makeRequest(type, url, data, onSuccess) {
  $.ajax({
    type: type,
    url: url,
    data: data,
    success: function success(data) {
      onSuccess(data);
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      alert('status code: ' + jqXHR.status + ' errorThrown: ' + errorThrown + ' jqXHR.responseText: ' + jqXHR.responseText);
    },
    dataType: "JSON"
  });
}

function submitCallback(data) {
  if (data) {
    alert(data.res);
  }
}

var Application = React.createClass({
  displayName: "Application",

  getInitialState: function getInitialState() {
    var arr = typeof localStorage['dialogArray'] != 'undefined' ? JSON.parse(localStorage["dialogArray"]) : [];
    var name = typeof localStorage['dialogName'] != 'undefined' ? JSON.parse(localStorage["dialogName"]) : "";
    return {
      dialogArray: arr,
      dialogName: name
    };
  },
  onDialogNameChanged: function onDialogNameChanged(event) {
    this.setState({ dialogName: event.target.value });
  },
  onAddDialog: function onAddDialog() {
    this.state.dialogArray.push({ dialogText: "", choices: [], conditions: [] });
    this.forceUpdate();
  },
  onRemoveDialog: function onRemoveDialog(index, event) {
    var arr = this.state.dialogArray;
    arr.splice(index, 1);
    this.setState({ dialogArray: arr });
  },
  onDialogTextChanged: function onDialogTextChanged(index, event) {
    this.state.dialogArray[index].dialogText = event.target.value;
    this.forceUpdate();
  },
  onAddChoice: function onAddChoice() {
    this.state.dialogArray[arguments[0]].choices.push({ text: "", value: "", nextDialog: "" });
    this.forceUpdate();
  },
  onRemoveChoice: function onRemoveChoice(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices.splice(choiceIndex, 1);
    this.forceUpdate();
  },
  onChoiceTextChanged: function onChoiceTextChanged(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices[choiceIndex].text = event.target.value;
    this.forceUpdate();
  },
  onChoiceFlagChanged: function onChoiceFlagChanged(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices[choiceIndex].flag = event.target.value;
    this.forceUpdate();
  },
  onChoiceValueChanged: function onChoiceValueChanged(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices[choiceIndex].value = event.target.value;
    this.forceUpdate();
  },
  onChoiceNextDialogChanged: function onChoiceNextDialogChanged(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices[choiceIndex].nextDialog = event.target.value;
    this.forceUpdate();
  },
  onAddCondition: function onAddCondition() {
    this.state.dialogArray[arguments[0]].conditions.push({ flag: "", value: "" });
    this.forceUpdate();
  },
  onRemoveCondition: function onRemoveCondition(dialogIndex, conditionIndex, event) {
    console.log(conditionIndex, this.state.dialogArray);
    this.state.dialogArray[dialogIndex].conditions.splice(conditionIndex, 1);
    this.forceUpdate();
  },
  onConditionFlagChanged: function onConditionFlagChanged(dialogIndex, conditionIndex, event) {
    this.state.dialogArray[dialogIndex].conditions[conditionIndex].flag = event.target.value;
    this.forceUpdate();
  },
  onConditionValueChanged: function onConditionValueChanged(dialogIndex, conditionIndex, event) {
    this.state.dialogArray[dialogIndex].conditions[conditionIndex].value = event.target.value;
    this.forceUpdate();
  },
  onConditionFailDialogChanged: function onConditionFailDialogChanged(dialogIndex, conditionIndex, event) {
    this.state.dialogArray[dialogIndex].conditions[conditionIndex].failDialog = event.target.value;
    this.forceUpdate();
  },
  onSaveAll: function onSaveAll() {
    localStorage.setItem("dialogArray", JSON.stringify(this.state.dialogArray));
    localStorage.setItem("dialogName", JSON.stringify(this.state.dialogName));
  },
  onDeleteAll: function onDeleteAll() {
    this.setState({ dialogArray: [] });
  },
  onSubmit: function onSubmit() {
    makeRequest("POST", urls.post, { dialogs: this.state.dialogArray, name: this.state.dialogName }, submitCallback);
  },
  onDownload: function onDownload() {
    window.location = urls.format + "?dialogs=" + JSON.stringify({ dialogs: this.state.dialogArray });
  },
  OnServerDialogSelected: function OnServerDialogSelected(dialogData, event) {
    this.setState({ dialogArray: dialogData.dialog, dialogName: dialogData.name });
  },
  render: function render() {
    var rows = [];
    for (var i = 0; i < this.state.dialogArray.length; i++) {
      var choices = [];
      for (var j = 0; j < this.state.dialogArray[i].choices.length; j++) {
        choices.push(React.createElement(Choice, { index: j, parentIndex: i, text: this.state.dialogArray[i].choices[j].text, flag: this.state.dialogArray[i].choices[j].flag, value: this.state.dialogArray[i].choices[j].value, nextDialog: this.state.dialogArray[i].choices[j].nextDialog, dialogCount: this.state.dialogArray.length, onRemoveChoice: this.onRemoveChoice, onChoiceTextChanged: this.onChoiceTextChanged, onChoiceFlagChanged: this.onChoiceFlagChanged, onChoiceValueChanged: this.onChoiceValueChanged, onChoiceNextDialogChanged: this.onChoiceNextDialogChanged }));
      }
      var conditions = [];
      for (j = 0; j < this.state.dialogArray[i].conditions.length; j++) {
        conditions.push(React.createElement(Condition, { index: j, parentIndex: i, flag: this.state.dialogArray[i].conditions[j].flag, value: this.state.dialogArray[i].conditions[j].value, onRemoveCondition: this.onRemoveCondition, onConditionFlagChanged: this.onConditionFlagChanged, onConditionValueChanged: this.onConditionValueChanged, onConditionFailDialogChanged: this.onConditionFailDialogChanged, conditionFailDialog: this.state.dialogArray[i].conditions[j].failDialog, dialogCount: this.state.dialogArray.length }));
      }
      rows.push(React.createElement(
        Panel,
        { header: "Dialog " + i, eventKey: i, bsStyle: "success" },
        React.createElement(Dialog, { index: i, dialogText: this.state.dialogArray[i].dialogText, conditions: conditions, choices: choices, onRemoveDialog: this.onRemoveDialog, onDialogTextChanged: this.onDialogTextChanged, onAddCondition: this.onAddCondition, onAddChoice: this.onAddChoice })
      ));
    }
    return React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-xs-4" },
        React.createElement(ServerData, { OnServerDialogSelected: this.OnServerDialogSelected })
      ),
      React.createElement(
        "div",
        { className: "col-xs-8" },
        React.createElement(
          "div",
          { className: "well" },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              null,
              "Dialog Name"
            ),
            React.createElement("input", { className: "choiceElement form-control", type: "text", value: this.state.dialogName, onChange: this.onDialogNameChanged })
          ),
          React.createElement(
            "h5",
            null,
            React.createElement(
              "b",
              null,
              "Dialog Data"
            )
          ),
          React.createElement(DialogList, { className: "well", data: rows })
        ),
        React.createElement(
          ButtonToolbar,
          null,
          React.createElement(
            Button,
            { bsStyle: "info", onClick: this.onAddDialog },
            "Add New Dialog"
          ),
          React.createElement(
            Button,
            { bsStyle: "success", onClick: this.onSaveAll },
            "Save All"
          ),
          React.createElement(
            Button,
            { bsStyle: "success", onClick: this.onSubmit },
            "Submit All"
          ),
          React.createElement(
            Button,
            { bsStyle: "primary", onClick: this.onDownload },
            "Download Formatted File"
          ),
          React.createElement(
            Button,
            { bsStyle: "danger", onClick: this.onDeleteAll },
            "Delete All"
          )
        )
      )
    );
  }
});

var ServerData = React.createClass({
  displayName: "ServerData",

  getInitialState: function getInitialState() {
    return { dialogData: [] };
  },
  componentDidMount: function componentDidMount() {
    var request = urls.get + "?query=" + JSON.stringify({});
    $.get(request, this.processServerData);
  },
  processServerData: function processServerData(data) {
    var dialogData = [];
    for (var i = 0; i < data.length; i++) {
      dialogData.push(data[i]);
    }
    this.setState({ dialogData: dialogData });
  },
  render: function render() {
    var names = [];
    for (var i = 0; i < this.state.dialogData.length; i++) {
      names.push(React.createElement(
        Button,
        { className: "full-width-button", bsStyle: "default", onClick: this.props.OnServerDialogSelected.bind(this, this.state.dialogData[i]) },
        this.state.dialogData[i].name
      ));
    }
    return React.createElement(
      "div",
      { className: "well side-panel" },
      React.createElement(
        "h4",
        { className: "centered-text" },
        "Data On Server"
      ),
      React.createElement(
        "p",
        null,
        " Click on a button to load a dialog from the server "
      ),
      React.createElement(
        "div",
        null,
        names
      )
    );
  }
});

var DialogList = React.createClass({
  displayName: "DialogList",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        Accordion,
        null,
        this.props.data
      )
    );
  }
});

var Dialog = React.createClass({
  displayName: "Dialog",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        { className: "text-center" },
        "Dialog ",
        this.props.index
      ),
      React.createElement("hr", null),
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Dialog Text"
        ),
        React.createElement("textarea", { className: "form-control", rows: "4", cols: "50", onChange: this.props.onDialogTextChanged.bind(this, this.props.index), value: this.props.dialogText })
      ),
      React.createElement(ConditionList, { conditions: this.props.conditions }),
      React.createElement(ChoiceList, { choices: this.props.choices }),
      React.createElement(
        ButtonToolbar,
        null,
        React.createElement(
          Button,
          { bsStyle: "info", onClick: this.props.onAddCondition.bind(this, this.props.index) },
          "Add Condition"
        ),
        React.createElement(
          Button,
          { bsStyle: "info", onClick: this.props.onAddChoice.bind(this, this.props.index) },
          "Add Choice"
        ),
        React.createElement(
          Button,
          { "class": "delete", bsStyle: "danger", onClick: this.props.onRemoveDialog.bind(this, this.props.index) },
          "Delete Dialog"
        )
      )
    );
  }
});

var ConditionList = React.createClass({
  displayName: "ConditionList",

  render: function render() {
    var conditions = this.props.conditions.map(function (item, i) {
      return React.createElement(
        Panel,
        { header: "Condition " + i, eventKey: i, bsStyle: "success" },
        item
      );
    });
    return React.createElement(
      Accordion,
      null,
      conditions
    );
  }
});

var Condition = React.createClass({
  displayName: "Condition",

  render: function render() {
    var nextOptions = [];
    nextOptions.push(React.createElement("option", { value: "" }));
    for (var i = 0; i < this.props.dialogCount; i++) {
      if (i == this.props.nextDialog) {
        nextOptions.push(React.createElement(
          "option",
          { value: i },
          i
        ));
      } else {
        nextOptions.push(React.createElement(
          "option",
          { value: i },
          i
        ));
      }
    }
    React.createElement(
      "h4",
      null,
      "Condition ",
      this.props.index
    );
    return React.createElement(
      "div",
      { className: "container-fluid" },
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Condition Flag"
        ),
        React.createElement("input", { className: "form-control", type: "text", onChange: this.props.onConditionFlagChanged.bind(this, this.props.parentIndex, this.props.index), value: this.props.flag })
      ),
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Condition Value"
        ),
        React.createElement("input", { className: "form-control", type: "text", onChange: this.props.onConditionValueChanged.bind(this, this.props.parentIndex, this.props.index), value: this.props.value })
      ),
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Dialog If Fail"
        ),
        React.createElement(
          "select",
          { value: this.props.failDialog, className: "form-control", onChange: this.props.onConditionFailDialogChanged.bind(this, this.props.parentIndex, this.props.index) },
          nextOptions
        )
      ),
      React.createElement(
        ButtonToolbar,
        null,
        React.createElement(
          Button,
          { "class": "delete", bsStyle: "danger", onClick: this.props.onRemoveCondition.bind(this, this.props.parentIndex, this.props.index) },
          "Delete Condition"
        )
      )
    );
  }
});

var ChoiceList = React.createClass({
  displayName: "ChoiceList",

  render: function render() {
    var choices = this.props.choices.map(function (item, i) {
      return React.createElement(
        Panel,
        { header: "Choice " + i, eventKey: i, bsStyle: "success" },
        item
      );
    });
    return React.createElement(
      Accordion,
      null,
      choices
    );
  }
});

var Choice = React.createClass({
  displayName: "Choice",

  render: function render() {
    var nextOptions = [];
    nextOptions.push(React.createElement("option", { value: "" }));
    for (var i = 0; i < this.props.dialogCount; i++) {
      if (i == this.props.nextDialog) {
        nextOptions.push(React.createElement(
          "option",
          { value: i },
          i
        ));
      } else {
        nextOptions.push(React.createElement(
          "option",
          { value: i },
          i
        ));
      }
    }
    React.createElement(
      "h4",
      null,
      "Choice ",
      this.props.index
    );
    return React.createElement(
      "div",
      { className: "container-fluid choice" },
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Choice Text"
        ),
        React.createElement("input", { className: "choiceElement form-control", type: "text", onChange: this.props.onChoiceTextChanged.bind(this, this.props.parentIndex, this.props.index), value: this.props.text })
      ),
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Choice Flag"
        ),
        React.createElement("input", { className: "choiceElement form-control", type: "text", onChange: this.props.onChoiceFlagChanged.bind(this, this.props.parentIndex, this.props.index), value: this.props.flag })
      ),
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Choice Value"
        ),
        React.createElement("input", { className: "choiceElement form-control", type: "text", onChange: this.props.onChoiceValueChanged.bind(this, this.props.parentIndex, this.props.index), value: this.props.value })
      ),
      React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
          "label",
          null,
          "Next Dialog"
        ),
        React.createElement(
          "select",
          { value: this.props.nextDialog, className: "choiceElement form-control", onChange: this.props.onChoiceNextDialogChanged.bind(this, this.props.parentIndex, this.props.index) },
          nextOptions
        )
      ),
      React.createElement(
        ButtonToolbar,
        null,
        React.createElement(
          Button,
          { "class": "delete", bsStyle: "danger", onClick: this.props.onRemoveChoice.bind(this, this.props.parentIndex, this.props.index) },
          "Delete Choice"
        )
      )
    );
  }
});

ReactDOM.render(React.createElement(Application, null), document.getElementById("app-hook"));
//update();