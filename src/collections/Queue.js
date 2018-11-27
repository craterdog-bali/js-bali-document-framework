/************************************************************************
 * Copyright (c) Crater Dog Technologies(TM).  All Rights Reserved.     *
 ************************************************************************
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.        *
 *                                                                      *
 * This code is free software; you can redistribute it and/or modify it *
 * under the terms of The MIT License (MIT), as published by the Open   *
 * Source Initiative. (See http://opensource.org/licenses/MIT)          *
 ************************************************************************/
'use strict';

/**
 * This collection class implements a queue (FIFO) data structure.  Attempting to retrieve
 * an item from an empty queue is considered a bug in the calling code and a runtime exception
 * is thrown.
 */
var types = require('../abstractions/Types');
var Composite = require('../abstractions/Composite').Composite;
var Collection = require('../abstractions/Collection').Collection;
var Iterator = require('../utilities/Iterator').Iterator;

/*
 * This function defines a missing stack function for the standard Array class.
 * The push(item) and pop() methods are already defined.
 */
Array.prototype.peek = function() {
    return this[this.length - 1];
};


// PUBLIC FUNCTIONS

/**
 * This constructor creates a new queue component with optional parameters that are
 * used to parameterize its type.
 * 
 * @param {Parameters} parameters Optional parameters used to parameterize this collection. 
 * @returns {Queue} The new queue.
 */
function Queue(parameters) {
    Collection.call(this, types.QUEUE, parameters);
    this.capacity = 1024;
    this.array = [];
    this.complexity += 2;  // account for the '[' ']' delimiters
    return this;
}
Queue.prototype = Object.create(Collection.prototype);
Queue.prototype.constructor = Queue;
exports.Queue = Queue;


/**
 * This function creates a new queue using the specified collection to seed the
 * initial items in the queue. The queue may be parameterized by specifying optional
 * parameters that are used to parameterize its type.
 * 
 * @param {Array|Object|Collection} collection The collection containing the initial
 * items to be used to seed the new queue.
 * @param {Parameters} parameters Optional parameters used to parameterize this collection. 
 * @returns {Queue} The new queue.
 */
Queue.fromCollection = function(collection, parameters) {
    var queue = new Queue(parameters);
    var iterator;
    var type = collection.constructor.name;
    switch (type) {
        case 'Array':
            collection.forEach(function(item) {
                queue.addItem(item);
            });
            break;
        case 'List':
        case 'Queue':
        case 'Set':
            iterator = collection.getIterator();
            while (iterator.hasNext()) {
                queue.addItem(iterator.getNext());
            }
            break;
        case 'Stack':
            iterator = collection.getIterator();
            // a stack's iterator starts at the top, we need to start at the bottom
            iterator.toEnd();
            while (iterator.hasPrevious()) {
                queue.addItem(iterator.getPrevious());
            }
            break;
        default:
            throw new Error('QUEUE: A queue cannot be initialized using a collection of type: ' + type);
    }
    return queue;
};


// PUBLIC METHODS

/**
 * This method accepts a visitor as part of the visitor pattern.
 * 
 * @param {Visitor} visitor The visitor that wants to visit this queue.
 */
Queue.prototype.acceptVisitor = function(visitor) {
    visitor.visitQueue(this);
};


/**
 * This method returns the number of items that are currently in this queue.
 * 
 * @returns {Number} The number of items in this queue.
 */
Queue.prototype.getSize = function() {
    var size = this.array.length;
    return size;
};


/**
 * This method returns an array containing the items in this queue.
 * 
 * @returns {Array} An array containing the items in this queue.
 */
Queue.prototype.toArray = function() {
    return this.array.slice();  // copy the array
};


/**
 * This method adds a new item to the end of this queue.
 *
 * @param {Component} item The new item to be added.
 */
Queue.prototype.addItem = function(item) {
    item = Composite.asComponent(item);
    if (this.array.length < this.capacity) {
        this.array.push(item);
        this.complexity += item.complexity;
    if (this.getSize() > 1) this.complexity += 2;  // account for the ', ' separator
    } else {
        throw new Error('QUEUE: Attempted to add an item to a full queue.');
    }
};


/**
 * This method removes the item at the beginning of this queue.  If this queue is empty
 * an exception is thrown.
 *
 * @returns {Component} The first item in this queue.
 */
Queue.prototype.removeItem = function() {
    var item;
    var size = this.array.length;
    if (size > 0) {
        item = this.array.splice(0, 1)[0];  // remove the first item in the array
        this.complexity -= item.complexity;
        if (this.getSize() > 0) this.complexity -= 2;  // account for the ', ' separator
    } else {
        throw new Error('QUEUE: Attempted to remove an item from an empty queue.');
    }
    return item;
};


/**
 * This method returns a reference to the first item in this queue without
 * removing it from the queue.  If this queue is empty an exception is thrown.
 *
 * @returns {Component} The first item in this queue.
 */
Queue.prototype.firstItem = function() {
    var item = null;
    var size = this.array.length;
    if (size > 0) {
        item = this.array[0];
    } else {
        throw new Error('QUEUE: Attempted to access the first item in an empty queue.');
    }
    return item;
};


/**
 * This method removes all items from this queue.
 */
Queue.prototype.removeAll = function() {
    var size = this.getSize();
    if (size > 1) this.complexity -= (size - 1) * 2;  // account for all the ', ' separators
    this.array.splice(0);
};