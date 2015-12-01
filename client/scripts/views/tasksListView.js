// Clients List View --> connected to Clients Collection

/*
For templates, look at client/views/backbone_templates.
*/

Lancealot.TasksListView = Backbone.View.extend({

  tagName: "table",
  className: 'table table-striped',

  template: Templates['tasktable'],

  initialize: function(options){
    this.url = options.jobId;
    this.total = 0;
    this.collection.on('sync', this.render, this);
    this.collection.fetch({
      url: '/api/job/' + this.url
    });
  },

  addOne: function(item){
    var view = new Lancealot.TaskRowView({ model: item });
    view.on('reinit', function () {
      this.collection.fetch({
        url: '/api/job/' + this.url
      })
    }, this);
    this.$el.append(view.render().el);
  },

  addAll: function(){
    this.collection.forEach(this.addOne, this);
    // this.$el.html(this.template(this.options));
  },

  render: function(){
    this.$el.empty();
    this.collection.forEach(function(item) {
      console.log(item)
      this.total += item.attributes.expenses.reduce(function (acc, expense) {
        return acc + expense.unit_price;
      }, 0) + item.attributes.employees.reduce(function (acc, employee) {
        return acc + employee._pivot_time_spent * employee.hourly_billing_fee;
      }, 0);
    }.bind(this));
    this.$el.html(this.template({total: this.total}));
    this.addAll();
    return this;
  },

  filteredRender: function(list) {
    this.$el.empty();
    this.$el.html(this.template());
    list.forEach(this.addOne, this);
  }

});
