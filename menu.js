"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyMenu = [{
        label: 'Editieren',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
        ]
    },
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    { role: 'window', submenu: [{ role: 'minimize' }, { role: 'close' }] },
    {
        role: 'help',
        submenu: [{
                label: 'Learn More',
                click: function () {
                    require('electron').shell.openExternal('https://electron.atom.io');
                }
            }]
    }
];
//# sourceMappingURL=menu.js.map