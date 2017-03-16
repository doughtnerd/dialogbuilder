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
  post: "/dialogs/submit",
  get: "/dialogs/retrieve",
  format: "/dialogs/format",
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
    alert(data.message);
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
    this.state.dialogArray.push({ dialogText: "", choices: [] });
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
  onChoiceValueChanged: function onChoiceValueChanged(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices[choiceIndex].value = event.target.value;
    this.forceUpdate();
  },
  onChoiceNextDialogChanged: function onChoiceNextDialogChanged(dialogIndex, choiceIndex, event) {
    this.state.dialogArray[dialogIndex].choices[choiceIndex].nextDialog = event.target.value;
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
        choices.push(React.createElement(Choice, { index: j, parentIndex: i, text: this.state.dialogArray[i].choices[j].text, value: this.state.dialogArray[i].choices[j].value, nextDialog: this.state.dialogArray[i].choices[j].nextDialog, dialogCount: this.state.dialogArray.length, onRemoveChoice: this.onRemoveChoice, onChoiceTextChanged: this.onChoiceTextChanged, onChoiceValueChanged: this.onChoiceValueChanged, onChoiceNextDialogChanged: this.onChoiceNextDialogChanged }));
      }
      rows.push(React.createElement(
        Panel,
        { header: "Dialog " + i, eventKey: i, bsStyle: "success" },
        React.createElement(Dialog, { index: i, dialogText: this.state.dialogArray[i].dialogText, choices: choices, onRemoveDialog: this.onRemoveDialog, onDialogTextChanged: this.onDialogTextChanged, onAddChoice: this.onAddChoice })
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
      React.createElement(ChoiceList, { choices: this.props.choices }),
      React.createElement(
        ButtonToolbar,
        null,
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

var ChoiceList = React.createClass({
  displayName: "ChoiceList",

  render: function render() {
    var choices = this.props.choices.map(function (item) {
      return React.createElement(
        ListGroupItem,
        null,
        item
      );
    });
    return React.createElement(
      ListGroup,
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
    return React.createElement(
      "div",
      { className: "container-fluid choice" },
      React.createElement(
        "h4",
        null,
        "Choice ",
        this.props.index
      ),
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