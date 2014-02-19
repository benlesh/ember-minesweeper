var GRID_WIDTH = 10,
    GRID_HEIGHT = 10,
    GRID_MINES = 10;

App = Ember.Application.create();


App.Router.map(function () {
    this.resource('about');
    this.resource('game');
});

App.inject('route', 'gridUtil', 'util:gridUtil');
App.inject('controller', 'gridUtil', 'util:gridUtil');

App.GameRoute = Ember.Route.extend({
    model: function () {
        var gridUtil = this.get('gridUtil');
        var grid = gridUtil.createGrid(GRID_WIDTH, GRID_HEIGHT);
        gridUtil.layMines(grid, GRID_MINES);
        return grid;
    }
});

App.GameController = Ember.ObjectController.extend({
    actions: {
        reveal: function (cell) {
            var gridUtil = this.get('gridUtil');
            Ember.set(cell, 'hidden', false);
            gridUtil.traverseNearbyCells(cell, function (cell) {
                Ember.set(cell, 'hidden', false);
            });
        }
    }
});

App.register('util:gridUtil',
    App.GridUtil = Ember.Object.extend({
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
                        grid: grid
                    };
                    row.cells.push(cell);
                }

                grid.rows.push(row);
            }

            return grid;
        },
        layMines: function (grid, mines) {
            var laid, x, y;
            for (laid = 0; laid < mines;) {
                x = Math.floor(Math.random() * grid.width);
                y = Math.floor(Math.random() * grid.height);
                cell = grid.rows[y].cells[x];
                if(!cell.mine) {
                    Ember.set(cell, 'mine', true);
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
        }
    })
);


