// JobRowView --> connected to Job Model

/*
For templates, look at client/views/backbone_templates.

Note: render and toggleComplete help deal with 
checking and unchecking checkboxes
*/

Lancealot.JobRowView = Backbone.View.extend({

  tagName: 'tr',
  className: 'clickable-row',

  events: {
    'click input:checkbox': 'toggleComplete',
    'click .deleteJob': 'deleteJob',
    'click .updateJob': 'updateJob',
    'click .goToTasks': 'goToTasks'
  },

  template: Templates['jobRow'],

  initialize: function() {
    this.model.on('change', this.render, this);
  },

  render: function() {

    // grabbing our job model's attributes
    var modelData = this.model.toJSON();

    modelData.dueDate = modelData.dueDate.split(' ').slice(1).join(' ');

    this.$el.html(this.template(modelData));

    return this;
  },

  // updates status of the job in DB (true v. false)
  toggleComplete: function(e) {
    var checked = e.target.checked;
    var client = this.model.attributes.client.name;
    this.model.save({status: checked});
  },

  deleteJob: function(e) {
    e && e.preventDefault();
    this.model.destroy();
  },

  updateJob: function(e) {
    e && e.preventDefault();
    var thisRow = this.$el[0];

    var description = $(thisRow).find('#jobDescription').text();
    var jobStatus = $(thisRow).find('#jobStatus').val();
    var dueDate = $(thisRow).find('#jobDueDate').text();

    dueDate = dueDate.split(' ');
    var dateNumbers = {Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12};
    dueDate = dueDate[2] + '-' + dateNumbers[dueDate[0]] + '-' + dueDate[1];

    this.model.set({
      job_name: description,
      job_status: jobStatus,
      due_date: dueDate
    });
    this.model.save(null, {
      success: function() {
        $('<div>Changes changed successfully!</div>').insertBefore('table')
          .delay(1500)
          .fadeOut(function() {
            $(this).remove(); 
          });
      }
    });
  },

  goToTasks: function() {
    Backbone.history.navigate('/job?id=' + this.model.get('id'), true);
  }

});
