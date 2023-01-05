"use strict";


function read64(addr) {
    return parseInt(host.memory.readMemoryValues(addr, 1, 8), 16);
}

class __heap_entry {
    constructor(addr, encoding) {
        this.addr = addr;
        this.encoding = encoding;
        this.size = parseInt(host.memory.readMemoryValues(this.addr+0x8, 1, 2),16);
    }
}

class __heap {
    constructor(base_address) {
        this.base_address = base_address;
        if( read64(this.base_address+0x28, 1, 8) != this.base_address) {
            dbglog("Corrupted heap header at: " + this.base_address);
            dbglog("It does not point to itself, but to " +  parseInt(host.memory.readMemoryValues(this.base_address+0x28, 1, 8), 16));
        }
        // Read the encoding
        this.encoding = read64(this.base_address+0x80);
        // Get the first real enbtr
        this.first_entry = read64(this.base_address+0x40);
        dbglog("This heap has fist entry: " + this.first_entry.toString(16));
        dbglog("This heap has encoding: " + this.encoding.toString(16));

    }
}

function dbglog(s) {
    host.diagnostics.debugLog(s + "\n");
}

function is_heap_ptr(ptr, heaps) {
    for (h of heaps) {
        if (ptr > h.base_address && ptr < h.base_address+h.size) {
            return true;
        }
    }
    return false;
}

function run_command(command) {
    let Control = host.namespace.Debugger.Utility.Control;
    var ret = [];
    var output = Control.ExecuteCommand(command);
    for (var line of output) {
        ret.push(line);
    }
    return ret;
}

function dbg_command(command) {
    let Control = host.namespace.Debugger.Utility.Control;
    var output = Control.ExecuteCommand(command);
    for (var line of output) {
        dbglog(line);
    }
}

function create_heaps() {
    var heaps = [];
    var output = run_command("!heap").slice(2);
    const re = /^\s+([0-9a-f]+)\s+([a-zA-Z ]+)/;
    for (var entry of output) {
        var entry_obj = entry.match(re).slice(1);
        var h = new __heap(parseInt(entry_obj[0], 16))
        heaps.push(h);
    }
    return heaps;
}

function heap_inspect()
{
}


function invokeScript() {
    // Setup the heap inspector script
    let Control = host.namespace.Debugger.Utility.Control;
    // Get heap objects using the heap command
    var heaps = create_heaps();
    dbglog("Done creating heap objects");
}
