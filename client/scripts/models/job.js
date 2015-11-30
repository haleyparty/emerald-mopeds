// Job Model
Lancealot.Job = Backbone.Model.extend({
  urlRoot: '/api/jobs',

  id: null,

  initialize: function() {
    this.set('dueDate', new Date(this.get('dueDate')).toDateString());
  }

});
