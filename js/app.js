var GRID_WIDTH = 10,
    GRID_HEIGHT = 10,
    GRID_MINES = 10;

App = Ember.Application.create();


App.Router.map(function () {
    this.resource('about');
});

App.inject('route', 'gridUtil', 'util:gridUtil');
App.inject('controller', 'gridUtil', 'util:gridUtil');
App.inject('view', 'gridUtil', 'util:gridUtil');

App.IndexRoute = Ember.Route.extend({
    model: function () {
        var gridUtil = this.get('gridUtil');
        var grid = gridUtil.createGrid(GRID_WIDTH, GRID_HEIGHT);
        gridUtil.layMines(grid, GRID_MINES);
        return grid;
    }
});

App.IndexController = Ember.ObjectController.extend({
    actions: {
        reveal: function (cell) {
            var gridUtil = this.get('gridUtil');
            gridUtil.revealCell(cell);
            gridUtil.checkLoss(cell);
        }
    }
});

App.CellView = Ember.View.extend({
    contextMenu: function (evt) {
        // The line below doesn't work, because in Ember, you can't
        // inject things into views.
        // var gridUtil = this.get('gridUtil');
        var cell = this.get('item');
        gridUtil.toggleFlag(cell);
        evt.preventDefault();
    },
    click: function (evt) {
        // The line below doesn't work, because in Ember, you can't
        // inject things into views.
        // var gridUtil = this.get('gridUtil');
        var cell = this.get('item');
        gridUtil.reveal(cell);
    }
});

// I'm putting this in global scope
// simply because Ember is unable to inject it
// into my view.
var gridUtil = {
    reveal: function (cell) {
        Ember.set(cell, 'hidden', false);
        if(cell.mine) {
            this.lose(cell.grid);
            return;
        }
        if(!cell.nearby) {
            this.revealEmpties(cell);
        }
        this.checkWin(cell.grid);
    },
    checkWin: function(grid) {
      var win = true;
      this.traverseAll(grid, function(e, cell) {
          if(!cell.mine && cell.hidden) {
              e.stop = true;
              win = false;
          }
      });
      if(win) {
          this.revealAll(grid);
          window.alert('you win!');
      }
    },
    toggleFlag: function (cell) {
        var flag = !cell.flag;
        Ember.set(cell, 'flag', flag);
    },
    lose: function (grid) {
        window.alert('you lose!');
        this.revealAll(grid);
    },
    revealCell: function (cell) {
        Ember.set(cell, 'hidden', false);
        if (!cell.nearby) {
            this.revealEmpties(cell);
        }
    },
    createGrid: function (w, h) {
        var grid = {
            width: w,
            height: h,
            rows: []
        };
        var x, y, row, cell;

        for (y = 0; y < w; y++) {
            row = {
                cells: []
            };

            for (x = 0; x < h; x++) {
                cell = {
                    x: x,
                    y: y,
                    mine: false,
                    hidden: true,
                    grid: grid,
                    nearby: 0,
                    nearbyClass: '',
                    flag: false
                };
                row.cells.push(cell);
            }

            grid.rows.push(row);
        }

        return grid;
    },
    revealAll: function (grid) {
        this.traverseAll(grid, function (e, cell) {
            Ember.set(cell, 'hidden', false);
        });
    },
    traverseAll: function (grid, fn) {
        var x, y, cell;
        var e = { stop: false };
        outer:
        for (y = 0; y < grid.height; y++) {
            for (x = 0; x < grid.width; x++) {
                cell = grid.rows[y].cells[x];
                fn(e, cell);
                if(e.stop) {
                    break outer;
                }
            }
        }
    },
    layMines: function (grid, mines) {
        var laid, x, y;
        for (laid = 0; laid < mines;) {
            x = Math.floor(Math.random() * grid.width);
            y = Math.floor(Math.random() * grid.height);
            cell = grid.rows[y].cells[x];
            if (!cell.mine) {
                Ember.set(cell, 'mine', true);
                this.traverseNearbyCells(cell, function (neighbor) {
                    neighbor.nearby++;
                    neighbor.nearbyClass = 'nearby-' + neighbor.nearby;
                });
                laid++;
            }
        }
    },
    traverseNearbyCells: function (cell, fn) {
        var grid = cell.grid;
        var x, y, currCell;

        for (y = Math.max(0, cell.y - 1); y <= Math.min(cell.y + 1, GRID_HEIGHT - 1); y++) {
            for (x = Math.max(0, cell.x - 1); x <= Math.min(cell.x + 1, GRID_WIDTH - 1); x++) {
                if (y !== cell.y || x !== cell.x) {
                    currCell = grid.rows[y].cells[x];
                    fn(currCell);
                }
            }
        }
    },
    revealEmpties: function (cell) {
        var self = this;
        Ember.set(cell, 'hidden', false)
        if (!cell.nearby) {
            self.traverseNearbyCells(cell, function (neighbor) {
                if (neighbor.hidden) {
                    self.revealEmpties(neighbor);
                }
            });
        }
    }
};



App.register('util:gridUtil',
    App.GridUtil = Ember.Object.extend(gridUtil)
);


