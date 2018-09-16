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
 * This library provides functions that parse a Bali document and
 * produce the corresponding parse tree structure.
 */
var antlr = require('antlr4');
var ErrorStrategy = require('antlr4/error/ErrorStrategy');
var grammar = require('../grammar');
var BaliDocument = require('../BaliDocument');
var Tree = require('../nodes/Tree').Tree;
var Terminal = require('../nodes/Terminal').Terminal;
var types = require('../nodes/Types');


/**
 * This function parses a Bali source string and returns the corresponding
 * document.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting document.
 */
exports.parseDocument = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.document();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * component.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting component.
 */
exports.parseComponent = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.component();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * parameters.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting parameters.
 */
exports.parseParameters = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.parameters();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * element.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting element.
 */
exports.parseElement = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.element();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * structure.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting structure.
 */
exports.parseStructure = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.structure();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * range.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting range.
 */
exports.parseRange = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.range();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * list.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting list.
 */
exports.parseList = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.list();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * catalog.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting catalog.
 */
exports.parseCatalog = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.catalog();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * procedure.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting procedure.
 */
exports.parseProcedure = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.procedure();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


/**
 * This function parses a Bali source string and returns the corresponding
 * expression.
 * 
 * @param {String} source The Bali source string.
 * @param {Boolean} debug Whether of not the parser should be run in debug mode, the
 * default is false.
 * @returns {BaliDocument} The resulting expression.
 */
exports.parseExpression = function(source, debug) {
    var parser = initializeParser(source, debug);
    var antlrTree = parser.expression();
    var baliTree = convertParseTree(antlrTree);
    return baliTree;
};


// PRIVATE FUNCTIONS

function initializeParser(source, debug) {
    var chars = new antlr.InputStream(source);
    var lexer = new grammar.BaliDocumentLexer(chars);
    var listener = new BaliErrorListener(debug);
    lexer.removeErrorListeners();
    lexer.addErrorListener(listener);
    var tokens = new antlr.CommonTokenStream(lexer);
    var parser = new grammar.BaliDocumentParser(tokens);
    parser.buildParseTrees = true;
    parser.removeErrorListeners();
    parser.addErrorListener(listener);
    parser._errHandler = new BaliErrorStrategy(debug);
    return parser;
}


// override the recover method in the lexer to fail fast
grammar.BaliDocumentLexer.prototype.recover = function(e) {
    var error = new Error('LEXER: Invalid input was detected, aborted scanning the input.');
    throw error;
};


function convertParseTree(antlrTree) {
    var visitor = new ParsingVisitor();
    antlrTree.accept(visitor);
    var baliTree = visitor.result;
    return baliTree;
}


// PRIVATE CLASSES

function ParsingVisitor() {
    grammar.BaliDocumentVisitor.call(this);
    this.depth = 0;
    return this;
}
ParsingVisitor.prototype = Object.create(grammar.BaliDocumentVisitor.prototype);
ParsingVisitor.prototype.constructor = ParsingVisitor;
ParsingVisitor.indentation = '    ';  // indentation per level


ParsingVisitor.prototype.getPadding = function() {
    var padding = '';
    for (var i = 0; i < this.depth; i++) {
        padding += ParsingVisitor.indentation;
    }
    return padding;
};


// angle: '~' real
ParsingVisitor.prototype.visitAngle = function(ctx) {
    ctx.real().accept(this);
    var value = '~' + this.result;
    var terminal = new Terminal(types.ANGLE, value);
    this.result = terminal;
};


// anyTemplate: 'any'
ParsingVisitor.prototype.visitAnyTemplate = function(ctx) {
    var value = 'any';
    this.result = new Terminal(types.TEMPLATE, value);
};


// arithmeticExpression: expression op=('*' | '/' | '//' | '+' | '-') expression
ParsingVisitor.prototype.visitArithmeticExpression = function(ctx) {
    var tree = new Tree(types.ARITHMETIC_EXPRESSION, 3);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    tree.operator = ctx.op.text;
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// association: component ':' expression
ParsingVisitor.prototype.visitAssociation = function(ctx) {
    var tree = new Tree(types.ASSOCIATION, 2);
    ctx.component().accept(this);
    var key = this.result;
    tree.addChild(key);
    ctx.expression().accept(this);
    var value = this.result;
    tree.addChild(value);
    this.result = tree;
};


// binary: BINARY
ParsingVisitor.prototype.visitBinary = function(ctx) {
    var value = ctx.BINARY().getText();
    var padding = this.getPadding();
    var regex = new RegExp('\\n' + padding, 'g');
    value = value.replace(regex, '\n');
    var terminal = new Terminal(types.BINARY, value);
    this.result = terminal;
};


// block: '{' procedure '}'
ParsingVisitor.prototype.visitBlock = function(ctx) {
    var tree = new Tree(types.BLOCK, 2);
    ctx.procedure().accept(this);
    tree.addChild(this.result);
    this.result.size = 100;
    this.result = tree;
};


// breakClause: 'break' 'loop'
ParsingVisitor.prototype.visitBreakClause = function(ctx) {
    var tree = new Tree(types.BREAK_CLAUSE, 10);
    this.result = tree;
};


// catalog:
//     association (',' association)* |
//     NEWLINE (association NEWLINE)* |
//     ':' /*empty catalog*/
ParsingVisitor.prototype.visitCatalog = function(ctx) {
    var tree = new Tree(types.CATALOG, 0);
    var type = ctx.constructor.name;
    if (type !== 'EmptyCatalogContext') {
        var associations = ctx.association();
        this.depth++;
        associations.forEach(function(association) {
            association.accept(this);
            tree.addChild(this.result);
            tree.size += 2;
        }, this);
        this.depth--;
    }
    this.result = tree;
};


// checkoutClause: 'checkout' recipient 'from' expression
ParsingVisitor.prototype.visitCheckoutClause = function(ctx) {
    var tree = new Tree(types.CHECKOUT_CLAUSE, 15);
    ctx.recipient().accept(this);
    tree.addChild(this.result);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// code: '{' procedure '}'
ParsingVisitor.prototype.visitCode = function(ctx) {
    var tree = new Tree(types.CODE, 2);
    ctx.procedure().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// commitClause: 'commit' expression 'to' expression
ParsingVisitor.prototype.visitCommitClause = function(ctx) {
    var tree = new Tree(types.COMMIT_CLAUSE, 11);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// comparisonExpression: expression op=('<' | '=' | '>' | 'is' | 'matches') expression
ParsingVisitor.prototype.visitComparisonExpression = function(ctx) {
    var tree = new Tree(types.COMPARISON_EXPRESSION, 9);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    tree.operator = ctx.op.text;
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// complementExpression: 'not' expression
ParsingVisitor.prototype.visitComplementExpression = function(ctx) {
    var tree = new Tree(types.COMPLEMENT_EXPRESSION, 4);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// complexNumber: '(' real del=(',' | 'e^') imaginary ')'
ParsingVisitor.prototype.visitComplexNumber = function(ctx) {
    var delimiter = ctx.del.text;
    var value = '(';
    ctx.real().accept(this);
    value += this.result;
    value += delimiter === ',' ? ', ' : ' e^';
    ctx.imaginary().accept(this);
    value += this.result;
    value += ')';
    var terminal = new Terminal(types.NUMBER, value);
    this.result = terminal;
};


// component: state parameters?
ParsingVisitor.prototype.visitComponent = function(ctx) {
    var tree = new Tree(types.COMPONENT, 0);
    ctx.children.forEach(function(child) {
        child.accept(this);
        tree.addChild(this.result);
    }, this);
    this.result = tree;
};


// constantReal: sign='-'? CONSTANT
ParsingVisitor.prototype.visitConstantReal = function(ctx) {
    var string = '';
    if (ctx.sign) {
        string += '-';
    }
    string += ctx.CONSTANT().getText();
    this.result = string;
};


// continueClause: 'continue' 'loop'
ParsingVisitor.prototype.visitContinueClause = function(ctx) {
    var tree = new Tree(types.CONTINUE_CLAUSE, 13);
    this.result = tree;
};


// defaultExpression: expression '?' expression
ParsingVisitor.prototype.visitDefaultExpression = function(ctx) {
    var tree = new Tree(types.DEFAULT_EXPRESSION, 3);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// dereferenceExpression: '@' expression
ParsingVisitor.prototype.visitDereferenceExpression = function(ctx) {
    var tree = new Tree(types.DEREFERENCE_EXPRESSION, 1);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// discardClause: 'discard' expression
ParsingVisitor.prototype.visitDiscardClause = function(ctx) {
    var tree = new Tree(types.DISCARD_CLAUSE, 8);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// document: NEWLINE* (reference NEWLINE)? content (NEWLINE seal)* NEWLINE* EOF
ParsingVisitor.prototype.visitDocument = function(ctx) {
    var previousReference;
    var reference = ctx.reference();
    if (reference) {
        reference.accept(this);
        previousReference = this.result;
    }

    ctx.content().accept(this);
    var documentContent = this.result;

    var document = BaliDocument.fromSource();
    document.documentContent = documentContent;
    document.previousReference = previousReference;

    var seals = ctx.seal();
    seals.forEach(function(seal) {
        seal.reference().accept(this);
        var certificateReference = this.result;
        seal.binary().accept(this);
        var digitalSignature = this.result;
        document.addSeal(certificateReference, digitalSignature);
    }, this);
    this.result = document;
};


// duration: DURATION
ParsingVisitor.prototype.visitDuration = function(ctx) {
    var value = ctx.DURATION().getText();
    var terminal = new Terminal(types.DURATION, value);
    this.result = terminal;
};


// emptyCatalog: ':' /*empty catalog*/
ParsingVisitor.prototype.visitEmptyCatalog = function(ctx) {
    // delegate to abstract type
    this.visitCatalog(ctx);
};

// emptyList: /*empty list*/
ParsingVisitor.prototype.visitEmptyList = function(ctx) {
    // delegate to abstract type
    this.visitList(ctx);
};


// emptyProcedure: /*empty procedure*/
ParsingVisitor.prototype.visitEmptyProcedure = function(ctx) {
    // delegate to abstract type
    this.visitProcedure(ctx);
};



// evaluateClause: (recipient ':=')? expression
ParsingVisitor.prototype.visitEvaluateClause = function(ctx) {
    var tree = new Tree(types.EVALUATE_CLAUSE, 0);
    var recipient = ctx.recipient();
    if (recipient) {
        ctx.recipient().accept(this);
        tree.addChild(this.result);
        tree.size += 4;
    }
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// exponentialExpression: <assoc=right> expression '^' expression
ParsingVisitor.prototype.visitExponentialExpression = function(ctx) {
    var tree = new Tree(types.EXPONENTIAL_EXPRESSION, 3);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// factorialExpression: expression '!'
ParsingVisitor.prototype.visitFactorialExpression = function(ctx) {
    var tree = new Tree(types.FACTORIAL_EXPRESSION, 1);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// falseProbability: 'false'
ParsingVisitor.prototype.visitFalseProbability = function(ctx) {
    var value = 'false';
    var terminal = new Terminal(types.PROBABILITY, value);
    this.result = terminal;
};


// fractionalProbability: FRACTION
ParsingVisitor.prototype.visitFractionalProbability = function(ctx) {
    var value = ctx.FRACTION().getText();
    var terminal = new Terminal(types.PROBABILITY, value);
    this.result = terminal;
};


// functionExpression: function parameters
ParsingVisitor.prototype.visitFunctionExpression = function(ctx) {
    var tree = new Tree(types.FUNCTION_EXPRESSION, 0);
    ctx.funxtion().accept(this);
    tree.addChild(this.result);
    ctx.parameters().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// funxtion: IDENTIFIER
ParsingVisitor.prototype.visitFunxtion = function(ctx) {
    var value = ctx.IDENTIFIER().getText();
    var terminal = new Terminal(types.FUNCTION, value);
    this.result = terminal;
};


// handleClause: 'handle' symbol 'matching' expression 'with' block
ParsingVisitor.prototype.visitHandleClause = function(ctx) {
    var tree = new Tree(types.HANDLE_CLAUSE, 100);
    ctx.symbol().accept(this);
    tree.addChild(this.result);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    ctx.block().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// ifClause: 'if' expression 'then' block ('else' 'if' expression 'then' block)* ('else' block)?
ParsingVisitor.prototype.visitIfClause = function(ctx) {
    var tree = new Tree(types.IF_CLAUSE, 100);
    var expressions = ctx.expression();
    var blocks = ctx.block();
    var hasElseBlock = blocks.length > expressions.length;
    for (var i = 0; i < expressions.length; i++) {
        expressions[i].accept(this);
        tree.addChild(this.result);
        blocks[i].accept(this);
        tree.addChild(this.result);
    }
    if (hasElseBlock) {
        blocks[blocks.length - 1].accept(this);
        tree.addChild(this.result);
    }
    this.result = tree;
};


// imaginary: (real | sign='-')? 'i'
ParsingVisitor.prototype.visitImaginary = function(ctx) {
    var string = '';
    var real = ctx.real();
    var sign = ctx.sign;
    if (real) {
        real.accept(this);
        string += this.result;
        if (real.constructor.name === 'ConstantRealContext') {
            string += ' ';
        }
    } else if (sign) {
        string += '-';
    }
    string += 'i';
    this.result = string;
};


// imaginaryNumber: imaginary
ParsingVisitor.prototype.visitImaginaryNumber = function(ctx) {
    ctx.imaginary().accept(this);
    var value = this.result;
    var terminal = new Terminal(types.NUMBER, value);
    this.result = terminal;
};


// indices: '[' list ']'
ParsingVisitor.prototype.visitIndices = function(ctx) {
    var tree = new Tree(types.INDICES, 2);
    ctx.list().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// infiniteNumber: 'infinity'
ParsingVisitor.prototype.visitInfiniteNumber = function(ctx) {
    var value = 'infinity';
    var terminal = new Terminal(types.NUMBER, value);
    this.result = terminal;
};


// inlineCatalog: association (',' association)*
ParsingVisitor.prototype.visitInlineCatalog = function(ctx) {
    // delegate to abstract type
    this.visitCatalog(ctx);
};


// inlineList: expression (',' expression)*
ParsingVisitor.prototype.visitInlineList = function(ctx) {
    // delegate to abstract type
    this.visitList(ctx);
};


// inlineProcedure: statement (';' statement)*
ParsingVisitor.prototype.visitInlineProcedure = function(ctx) {
    // delegate to abstract type
    this.visitProcedure(ctx);
};


// inlineText: TEXT
ParsingVisitor.prototype.visitInlineText = function(ctx) {
    var value = ctx.TEXT().getText();
    var terminal = new Terminal(types.TEXT, value);
    this.result = terminal;
};


// inversionExpression: op=('-' | '/' | '*') expression
ParsingVisitor.prototype.visitInversionExpression = function(ctx) {
    var tree = new Tree(types.INVERSION_EXPRESSION, 1);
    tree.operator = ctx.op.text;
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// list:
//     expression (',' expression)* |
//     NEWLINE (expression NEWLINE)* |
//     /*empty list*/
ParsingVisitor.prototype.visitList = function(ctx) {
    var tree = new Tree(types.LIST, 0);
    var type = ctx.constructor.name;
    if (type !== 'EmptyListContext') {
        var expressions = ctx.expression();
        this.depth++;
        expressions.forEach(function(expression) {
            expression.accept(this);
            tree.addChild(this.result);
            tree.size += 2;
        }, this);
        this.depth--;
    }
    this.result = tree;
};


// logicalExpression: expression op=('and' | 'sans' | 'xor' | 'or') expression
ParsingVisitor.prototype.visitLogicalExpression = function(ctx) {
    var tree = new Tree(types.LOGICAL_EXPRESSION, 6);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    tree.operator = ctx.op.text;
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// magnitudeExpression: '|' expression '|'
ParsingVisitor.prototype.visitMagnitudeExpression = function(ctx) {
    var tree = new Tree(types.MAGNITUDE_EXPRESSION, 2);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// message: IDENTIFIER
ParsingVisitor.prototype.visitMessage = function(ctx) {
    var value = ctx.IDENTIFIER().getText();
    var terminal = new Terminal(types.MESSAGE, value);
    this.result = terminal;
};


// messageExpression: expression '.' message parameters
ParsingVisitor.prototype.visitMessageExpression = function(ctx) {
    var tree = new Tree(types.MESSAGE_EXPRESSION, 1);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    ctx.message().accept(this);
    tree.addChild(this.result);
    ctx.parameters().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// moment: MOMENT
ParsingVisitor.prototype.visitMoment = function(ctx) {
    var value = ctx.MOMENT().getText();
    var terminal = new Terminal(types.MOMENT, value);
    this.result = terminal;
};


// newlineCatalog: NEWLINE (association NEWLINE)*
ParsingVisitor.prototype.visitNewlineCatalog = function(ctx) {
    // delegate to abstract type
    this.visitCatalog(ctx);
};


// newlineList: NEWLINE (expression NEWLINE)*
ParsingVisitor.prototype.visitNewlineList = function(ctx) {
    // delegate to abstract type
    this.visitList(ctx);
};


// newlineProcedure: NEWLINE (statement NEWLINE)*
ParsingVisitor.prototype.visitNewlineProcedure = function(ctx) {
    // delegate to abstract type
    this.visitProcedure(ctx);
};


// newlineText: TEXT_BLOCK
ParsingVisitor.prototype.visitNewlineText = function(ctx) {
    var value = ctx.TEXT_BLOCK().getText();
    var padding = this.getPadding();
    var regex = new RegExp('\\n' + padding, 'g');
    value = value.replace(regex, '\n');
    var terminal = new Terminal(types.TEXT, value);
    terminal.size = 100;
    this.result = terminal;
};


// noneTemplate: 'none'
ParsingVisitor.prototype.visitNoneTemplate = function(ctx) {
    var value = 'none';
    this.result = new Terminal(types.TEMPLATE, value);
};


// parameters: '(' collection ')'
ParsingVisitor.prototype.visitParameters = function(ctx) {
    var tree = new Tree(types.PARAMETERS, 2);
    ctx.collection().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// percent: real '%'
ParsingVisitor.prototype.visitPercent = function(ctx) {
    ctx.real().accept(this);
    var value = this.result + '%';
    var terminal = new Terminal(types.PERCENT, value);
    this.result = terminal;
};


// precedenceExpression: '(' expression ')'
ParsingVisitor.prototype.visitPrecedenceExpression = function(ctx) {
    var tree = new Tree(types.PRECEDENCE_EXPRESSION, 2);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// procedure:
//     statement (';' statement)*   |
//     NEWLINE (statement NEWLINE)* |
//     /*empty statements*/
ParsingVisitor.prototype.visitProcedure = function(ctx) {
    var tree = new Tree(types.PROCEDURE, 0);
    var type = ctx.constructor.name;
    if (type !== 'EmptyProcedureContext') {
        var statements = ctx.statement();
        this.depth++;
        statements.forEach(function(statement) {
            statement.accept(this);
            tree.addChild(this.result);
            tree.size += 2;
        }, this);
        this.depth--;
    }
    this.result = tree;
};


// publishClause: 'publish' expression
ParsingVisitor.prototype.visitPublishClause = function(ctx) {
    var tree = new Tree(types.PUBLISH_CLAUSE, 8);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// queueClause: 'queue' expression 'on' expression
ParsingVisitor.prototype.visitQueueClause = function(ctx) {
    var tree = new Tree(types.QUEUE_CLAUSE, 10);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// range: expression '..' expression
ParsingVisitor.prototype.visitRange = function(ctx) {
    var tree = new Tree(types.RANGE, 2);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// realNumber: real
ParsingVisitor.prototype.visitRealNumber = function(ctx) {
    ctx.real().accept(this);
    var value = this.result;
    var terminal = new Terminal(types.NUMBER, value);
    this.result = terminal;
};


// reference: RESOURCE
ParsingVisitor.prototype.visitReference = function(ctx) {
    var value = ctx.RESOURCE().getText();
    var terminal = new Terminal(types.REFERENCE, value);
    this.result = terminal;
};


// regexTemplate: REGEX
ParsingVisitor.prototype.visitRegexTemplate = function(ctx) {
    var value = ctx.REGEX().getText();
    var terminal = new Terminal(types.TEMPLATE, value);
    this.result = terminal;
};


// returnClause: 'return' expression?
ParsingVisitor.prototype.visitReturnClause = function(ctx) {
    var tree = new Tree(types.RETURN_CLAUSE, 6);
    var expression = ctx.expression();
    if (expression) {
        expression.accept(this);
        tree.addChild(this.result);
        tree.size += 1;
    }
    this.result = tree;
};


// saveClause: 'save' expression 'to' expression
ParsingVisitor.prototype.visitSaveClause = function(ctx) {
    var tree = new Tree(types.SAVE_CLAUSE, 9);
    var expressions = ctx.expression();
    expressions[0].accept(this);
    tree.addChild(this.result);
    expressions[1].accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// selectClause: 'select' expression 'from' (expression 'do' block)+ ('else' block)?
ParsingVisitor.prototype.visitSelectClause = function(ctx) {
    var tree = new Tree(types.SELECT_CLAUSE, 100);
    var expressions = ctx.expression();
    var selector = expressions[0];
    expressions = expressions.slice(1);  // remove the first expression
    var blocks = ctx.block();
    var hasElseBlock = blocks.length > expressions.length;
    selector.accept(this);
    tree.addChild(this.result);
    for (var i = 0; i < expressions.length; i++) {
        expressions[i].accept(this);
        tree.addChild(this.result);
        blocks[i].accept(this);
        tree.addChild(this.result);
    }
    if (hasElseBlock) {
        blocks[blocks.length - 1].accept(this);
        tree.addChild(this.result);
    }
    this.result = tree;
};


// statement: mainClause handleClause*
ParsingVisitor.prototype.visitStatement = function(ctx) {
    var tree = new Tree(types.STATEMENT, 0);
    ctx.mainClause().accept(this);
    tree.addChild(this.result);
    var handleClauses = ctx.handleClause();
    handleClauses.forEach(function(clause) {
        clause.accept(this);
        tree.addChild(this.result);
        tree.size += 1;
    }, this);
    this.result = tree;
};


// structure: '[' collection ']'
ParsingVisitor.prototype.visitStructure = function(ctx) {
    var tree = new Tree(types.STRUCTURE, 2);
    ctx.collection().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// subcomponent: variable indices
ParsingVisitor.prototype.visitSubcomponent = function(ctx) {
    var tree = new Tree(types.SUBCOMPONENT, 0);
    ctx.variable().accept(this);
    tree.addChild(this.result);
    ctx.indices().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// subcomponentExpression: expression indices
ParsingVisitor.prototype.visitSubcomponentExpression = function(ctx) {
    var tree = new Tree(types.SUBCOMPONENT_EXPRESSION, 0);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    ctx.indices().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// symbol: SYMBOL
ParsingVisitor.prototype.visitSymbol = function(ctx) {
    var value = ctx.SYMBOL().getText();
    var terminal = new Terminal(types.SYMBOL, value);
    this.result = terminal;
};


// tag: TAG
ParsingVisitor.prototype.visitTag = function(ctx) {
    var value = ctx.TAG().getText();
    var terminal = new Terminal(types.TAG, value);
    this.result = terminal;
};


// throwClause: 'throw' expression
ParsingVisitor.prototype.visitThrowClause = function(ctx) {
    var tree = new Tree(types.THROW_CLAUSE, 6);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// trueProbability: 'true'
ParsingVisitor.prototype.visitTrueProbability = function(ctx) {
    var value = 'true';
    var terminal = new Terminal(types.PROBABILITY, value);
    this.result = terminal;
};


// undefinedNumber: 'undefined'
ParsingVisitor.prototype.visitUndefinedNumber = function(ctx) {
    var value = 'undefined';
    var terminal = new Terminal(types.NUMBER, value);
    this.result = terminal;
};


// variable: IDENTIFIER
ParsingVisitor.prototype.visitVariable = function(ctx) {
    var value = ctx.IDENTIFIER().getText();
    var terminal = new Terminal(types.VARIABLE, value);
    this.result = terminal;
};


// variableReal: FLOAT
ParsingVisitor.prototype.visitVariableReal = function(ctx) {
    this.result = ctx.FLOAT().getText();
};


// version: VERSION
ParsingVisitor.prototype.visitVersion = function(ctx) {
    var value = ctx.VERSION().getText();
    var terminal = new Terminal(types.VERSION, value);
    this.result = terminal;
};


// waitClause: 'wait' 'for' recipient 'from' expression
ParsingVisitor.prototype.visitWaitClause = function(ctx) {
    var tree = new Tree(types.WAIT_CLAUSE, 15);
    ctx.recipient().accept(this);
    tree.addChild(this.result);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// whileClause: 'while' expression 'do' block
ParsingVisitor.prototype.visitWhileClause = function(ctx) {
    var tree = new Tree(types.WHILE_CLAUSE, 100);
    ctx.expression().accept(this);
    tree.addChild(this.result);
    ctx.block().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


// withClause: 'with' ('each' symbol 'in')? expression 'do' block
ParsingVisitor.prototype.visitWithClause = function(ctx) {
    var tree = new Tree(types.WITH_CLAUSE, 100);
    var symbol = ctx.symbol();
    if (symbol) {
        symbol.accept(this);
        tree.addChild(this.result);
    }
    ctx.expression().accept(this);
    tree.addChild(this.result);
    ctx.block().accept(this);
    tree.addChild(this.result);
    this.result = tree;
};


function BaliErrorStrategy(debug) {
    ErrorStrategy.DefaultErrorStrategy.call(this);
    this.debug = debug;
    return this;
}
BaliErrorStrategy.prototype = Object.create(ErrorStrategy.DefaultErrorStrategy.prototype);
BaliErrorStrategy.prototype.constructor = BaliErrorStrategy;


BaliErrorStrategy.prototype.reportError = function(recognizer, e) {
   // if we've already reported an error and have not matched a token
   // yet successfully, don't report any errors.
    if(this.debug && !this.inErrorRecoveryMode(recognizer)) {
        this.beginErrorCondition(recognizer);
        if ( e instanceof antlr.error.NoViableAltException ) {
            this.reportNoViableAlternative(recognizer, e);
        } else if ( e instanceof antlr.error.InputMismatchException ) {
            this.reportInputMismatch(recognizer, e);
        } else if ( e instanceof antlr.error.FailedPredicateException ) {
            this.reportFailedPredicate(recognizer, e);
        } else {
            console.log('PARSER: An unknown error occured: ' + e.constructor.name);
            console.log(e.stack);
            recognizer.notifyErrorListeners(e.getMessage(), recognizer.getCurrentToken(), e);
        }
    }
};


BaliErrorStrategy.prototype.recover = function(recognizer, e) {
    var context = recognizer._ctx;
    while (context !== null) {
        context.exception = e;
        context = context.parentCtx;
    }
    var error = new Error('PARSER: Invalid input was detected, aborted parsing the input.');
    throw error;
};


BaliErrorStrategy.prototype.recoverInline = function(recognizer) {
    this.recover(recognizer, new antlr.error.InputMismatchException(recognizer));
};


BaliErrorStrategy.prototype.sync = function(recognizer) {
    // ignore
};


BaliErrorStrategy.prototype.reportNoViableAlternative = function(recognizer, e) {
    var tokens = recognizer.getTokenStream();
    var token;
    if(tokens !== null) {
        if (e.startToken.type===antlr.Token.EOF) {
            token = "<EOF>";
        } else {
            token = tokens.tokens[e.offendingToken.tokenIndex];
        }
    } else {
        token = "<unknown>";
    }
    var message = 'PARSER: An invalid token was encountered: ' + this.getTokenErrorDisplay(e.offendingToken);
    recognizer.notifyErrorListeners(message, e.offendingToken, e);
};


BaliErrorStrategy.prototype.reportInputMismatch = function(recognizer, e) {
    var message = 'PARSER: A mismatched token was encountered: "' + this.getTokenErrorDisplay(e.offendingToken) +
          '", expected: ' + e.getExpectedTokens().toString(recognizer.literalNames, recognizer.symbolicNames);
    recognizer.notifyErrorListeners(message, e.offendingToken, e);
};


BaliErrorStrategy.prototype.reportFailedPredicate = function(recognizer, e) {
    var ruleName = recognizer.ruleNames[recognizer._ctx.ruleIndex];
    var message = 'PARSER: A predicate match failed for rule(' + ruleName + '): ' + e.message;
    recognizer.notifyErrorListeners(message, e.offendingToken, e);
};


BaliErrorStrategy.prototype.reportUnwantedToken = function(recognizer) {
    if (this.inErrorRecoveryMode(recognizer)) {
        return;
    }
    this.beginErrorCondition(recognizer);
    var token = recognizer.getCurrentToken();
    var expecting = this.getExpectedTokens(recognizer);
    var message = 'PARSER: An extra token was encountered: "' + this.getTokenErrorDisplay(token) + "' expecting " +
        expecting.toString(recognizer.literalNames, recognizer.symbolicNames);
    recognizer.notifyErrorListeners(message, token, null);
};


BaliErrorStrategy.prototype.reportMissingToken = function(recognizer) {
    if ( this.inErrorRecoveryMode(recognizer)) {
        return;
    }
    this.beginErrorCondition(recognizer);
    var token = recognizer.getCurrentToken();
    var expecting = this.getExpectedTokens(recognizer);
    var message = 'PARSER: A token is missing, expected: ' + expecting.toString(recognizer.literalNames, recognizer.symbolicNames) +
          ' at "' + this.getTokenErrorDisplay(token) + '"';
    recognizer.notifyErrorListeners(message, token, null);
};


function BaliErrorListener(debug) {
    antlr.error.ErrorListener.call(this);
    this.exactOnly = true;  // 'true' results in uninteresting ambiguities so leave 'false'
    this.debug = debug;
    return this;
}
BaliErrorListener.prototype = Object.create(antlr.error.ErrorListener.prototype);
BaliErrorListener.prototype.constructor = BaliErrorListener;


BaliErrorListener.prototype.syntaxError = function(recognizer, offendingToken, lineNumber, columnNumber, message, e) {
    if (this.debug) {
        // handle lexer vs parser differences
        var input = offendingToken ? offendingToken.getInputStream() : recognizer._input;
        var lines = input.toString().split('\n');
        message = offendingToken ? message : 'LEXER: An unexpected character was encountered: "' + lines[lineNumber - 1][columnNumber] + '"';

        // log the error message
        console.log(message.slice(0, 160));

        // log the lines before and after the invalid line and highlight the invalid token
        if (lineNumber > 1) console.log(lines[lineNumber - 2]);
        console.log(lines[lineNumber - 1]);
        var line = '';
        for (var i = 0; i < columnNumber; i++) {
            line += ' ';
        }
        var start = offendingToken ? offendingToken.start : columnNumber;
        var stop = offendingToken ? offendingToken.stop : columnNumber;
        while (start++ <= stop) {
            line += '^';
        }
        console.log(line);
        if (lineNumber < lines.length) console.log(lines[lineNumber]);

        // log the error stack
        if (e) console.log(e.stack);
    }
};


BaliErrorListener.prototype.reportAmbiguity = function(recognizer, dfa, startIndex, stopIndex, exact, ambigAlts, configs) {
    var message = 'PARSER: Ambiguous input was encountered for rule: ' + this.getDecisionDescription(recognizer, dfa) +
        ', possible alternatives: ' + this.getConflictingAlts(ambigAlts, configs);
    recognizer.notifyErrorListeners(message, recognizer._input.LT(-1));
};


BaliErrorListener.prototype.reportAttemptingFullContext = function(recognizer, dfa, startIndex, stopIndex, conflictingAlts, configs) {
};


BaliErrorListener.prototype.reportContextSensitivity = function(recognizer, dfa, startIndex, stopIndex, prediction, configs) {
    var message = 'PARSER Encountered a context sensitive rule: ' + this.getDecisionDescription(recognizer, dfa);
    recognizer.notifyErrorListeners(message, recognizer.getCurrentToken());
};


BaliErrorListener.prototype.getDecisionDescription = function(recognizer, dfa) {
    var decision = dfa.decision;
    var ruleIndex = dfa.atnStartState.ruleIndex;

    var ruleNames = recognizer.ruleNames;
    if (ruleIndex < 0 || ruleIndex >= ruleNames.length) {
        return "" + decision;
    }
    var ruleName = ruleNames[ruleIndex] || null;
    if (ruleName === null || ruleName.length === 0) {
        return "" + decision;
    }
    return "" + decision + " (" + ruleName + ")";
};


BaliErrorListener.prototype.getConflictingAlts = function(reportedAlts, configs) {
    if (reportedAlts !== null) {
        return reportedAlts;
    }
    var result = new antlr.Utils.BitSet();
    for (var i = 0; i < configs.items.length; i++) {
        result.add(configs.items[i].alt);
    }
    return "{" + result.values().join(", ") + "}";
};


BaliErrorListener.prototype.enterEveryRule = function(context) {
};


BaliErrorListener.prototype.visitTerminal = function(node) {
};


BaliErrorListener.prototype.visitErrorNode = function(node) {
};


BaliErrorListener.prototype.exitEveryRule = function(context) {
};
