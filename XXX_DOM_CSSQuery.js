
// TODO optimize & split off into separate files

var XXX_DOM_CSSQuery_Selector =
{								 
	parse: function (selector)
	{
		selector = XXX_DOM_CSSQuery_AttributeSelector.parse(selector);
		
		// trim whitespace
		selector = XXX_String_Pattern.replace(selector, '\\s*([\\s>+~(),]|^|$)\\s*', '', '$1');
		
		// e.g. ".class1" --> "*.class1"
		selector = XXX_String_Pattern.replace(selector, '([\\s>+~,]|[^(]\\+|^)([#.:@])', '', '$1*$2');
		
		return selector;
	},
	
	// convert css selectors to an array of tokens and filters		
	convertToParts: function (selector)
	{		
		if (XXX_String_Pattern.hasMatch(selector, '^[^\\s>+~]', ''))
		{
			selector = ' ' + selector;
		}
		
		return XXX_String_Pattern.getMatches(selector, '[\\s#.:>+~()@]|[^\\s#.:>+~()@]+', '')[0] || [];
	}
};

var XXX_DOM_CSSQuery_AttributeSelector =
{
	cache: [],
	
	tests:
	{
		// CSS Level 2
			'': function (attribute) { return attribute; },		
			'=': function (attribute, value) { return attribute + ' == ' + XXX_String.addQuotes(value); },		
			'~=': function (attribute, value) { return 'XXX_String_Pattern.hasMatch(' + attribute + ', \'(^| )' + XXX_DOM_CSSQuery.escapePattern(value) + '( |$)\', \'\')'; },		
			'|=': function (attribute, value) { return 'XXX_String_Pattern.hasMatch(' + attribute + ', \'^' + XXX_DOM_CSSQuery.escapePattern(value) + '(-|$)\', \'\')'; },
		
		// CSS Level 3
			'^=': function (attribute, value) { return 'XXX_String_Pattern.hasMatch(' + attribute + ', \'^' + XXX_DOM_CSSQuery.escapePattern(value) + '\', \'\')'; },		
			'$=': function (attribute, value) { return 'XXX_String_Pattern.hasMatch(' + attribute + ', \'' + XXX_DOM_CSSQuery.escapePattern(value) + '$\', \'\')'; },		
			'*=': function (attribute, value) { return 'XXX_String_Pattern.hasMatch(' + attribute + ', \'' + XXX_DOM_CSSQuery.escapePattern(value) + '\', \'\')'; }
	},
	
	replace: function (definition, attribute, compare, value)
	{
		var key = '@' + definition;
		
		if (!XXX_DOM_CSSQuery.attributeSelectors[key])
		{
			attribute = this.create(attribute, compare || '', value || '');
			
			XXX_DOM_CSSQuery.attributeSelectors[key] = attribute;
			XXX_DOM_CSSQuery.attributeSelectors.push(attribute);
		}
		
		return XXX_DOM_CSSQuery.attributeSelectors[key].ID;
	},
	
	// TODO optimize the call chain and avoid the evaluated on the fly functions...
	create: function (attributeName, whichTest, value)
	{
		var attributeSelector = {};
		
		attributeSelector.ID = '@' + XXX_DOM_CSSQuery.attributeSelectors.length;
		attributeSelector.name = attributeName;
		
		var test = XXX_DOM_CSSQuery_AttributeSelector.tests[whichTest];
		
		var attribute = this.getAttribute(attributeName);
		
		test = test ? test(attribute, XXX_String.removeQuotes(value)) : false;
				
		attributeSelector.test = new Function('e', 'return ' + test);
		
		return attributeSelector;
	},
	
	getAttribute: function (name)
	{
		switch (XXX_String.convertToLowerCase(name))
		{
			case 'id':
				return 'e.id';
			case 'class':
				return 'e.className';
			case 'for':
				return 'e.htmlFor';
			case 'href':
				if (XXX_HTTP_Browser.IE_WIN)
				{
					// IE always returns the full path not the fragment in the href attribute so we RegExp it out of outerHTML.
					// Opera does the same thing but there is no way to get the original attribute.
					return 'String((XXX_String_Pattern.getMatches(e.outerHTML, \'href=\\\\x22?([^\\\\s\\\\x22]*)\\\\x22?\', \'\') || [])[1] || \'\')';
				}
		}
		
		return 'e.getAttribute(\'' + XXX_String.replace(name, '\\|', ':') + '\')';
	}
	,
	parse: function (selector)
	{
		selector = XXX_String_Pattern.replace(selector, '\\\\:', '', '|');
		
		var attributeSpecificationParts = XXX_String_Pattern.getMatches(selector, '\\[([\\w-]+(\\|[\\w-]+)?)\\s*(\\W?=)?\\s*([^\\]]*)\\]', '');
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(attributeSpecificationParts[0]); i < iEnd; ++i)
		{
			var attributeSelectorID = this.replace(attributeSpecificationParts[0][i], attributeSpecificationParts[1][i], attributeSpecificationParts[3][i], attributeSpecificationParts[4][i]);
			
			selector = XXX_String.replace(selector, attributeSpecificationParts[0][i], attributeSelectorID);
		}
		
		return selector;
	}	
};

var XXX_DOM_CSSQuery =
{
	escapePattern: function (string)
	{
		return XXX_String_Pattern.replace(string, '([\\/()[\\]?{}|*+-])', '', '\\$1');
	},
	
	selectors:
	{
		// CSS Level 1
		
			// descendant selector
			' ': function (results, from, tagName, nameSpace)
			{
				// loop through current selection
				var element, i, iEnd, j;
				for (i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(from); i < iEnd; ++i)
				{
					// get descendants
					var subset = XXX_DOM.getByTagName(from[i], tagName, nameSpace);
					
					// loop through descendants and add to results selection
					for (j = 0; (element = subset[j]); ++j)
					{
						if (XXX_DOM.genuineElement(element) && XXX_DOM.compareNameSpace(element, nameSpace))
						{
							results.push(element);
						}
					}
				}
			},
			
			// ID selector
			'#': function (results, from, ID)
			{
				// loop through current selection and check ID
				var element, j;
				for (j = 0; (element = from[j]); ++j)
				{
					if (element.id == ID)
					{
						results.push(element);
					}
				}
			},
			
			// class selector
			'.': function (results, from, className)
			{
				// loop through current selection and check class
				var element, i;
				
				for (i = 0; (element = from[i]); ++i)
				{
					if (XXX_String_Pattern.hasMatch(element.className, '(^|\\s)' + className + '(\\s|$)', ''))
					{
						results.push(element);
					}
				}
			},
			
			// pseudo-class selector
			':': function (results, from, pseudoClass, arguments)
			{
				// retrieve the cssQuery pseudo-class function
				var test = XXX_DOM_CSSQuery.pseudoClasses[pseudoClass], element, i;
				
				// loop through current selection and apply pseudo-class filter
				if (test)
				{
					for (i = 0; (element = from[i]); ++i)
					{
						// if the cssQuery pseudo-class function returns "true" add the element
						if (test(element, arguments))
						{
							results.push(element);
						}
					}
				}
			},
		
		// CSS Level 2
		
			// child selector
			'>': function (results, from, tagName, nameSpace)
			{
				var element, i, iEnd, j;
				for (i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(from); i < iEnd; ++i)
				{
					var subset = XXX_DOM.getChildren(from[i]);
					for (j = 0; (element = subset[j]); ++j)
					{
						if (XXX_DOM.compareTagName(element, tagName, nameSpace))
						{
							results.push(element);
						}
					}
				}
			},
			
			// sibling selector
			'+': function (results, from, tagName, nameSpace)
			{
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(from); i < iEnd; ++i)
				{
					var element = XXX_DOM.getNextSibling(from[i]);
					
					if (element && XXX_DOM.compareTagName(element, tagName, nameSpace))
					{
						results.push(element);
					}
				}
			},
			
			// attribute selector
			'@': function (results, from, attributeSelectorID)
			{
				var test = XXX_DOM_CSSQuery.attributeSelectors[attributeSelectorID].test;
				var element, i;
				for (i = 0; (element = from[i]); ++i)
				{
					if (test(element))
					{
						results.push(element);
					}
				}
			},
		
		// CSS Level 3
		
			// indirect sibling selector
			'~': function(results, from, tagName, nameSpace)
			{
				var element, i;
				
				for (i = 0; (element = from[i]); ++i)
				{
					while (element = XXX_DOM.getNextSibling(element))
					{
						if (XXX_DOM.compareTagName(element, tagName, nameSpace))
						{
							results.push(element);
						}
					}
				}
			}
	},
	
	pseudoClasses:
	{
		
		// CSS Level 1
		
			'link': function (element)
			{
				var tempDocument = XXX_DOM.getDocument(element);
				
				if (tempDocument.links)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(tempDocument.links); i < iEnd; ++i)
					{
						if (tempDocument.links[i] == element)
						{
							return true;
						}
					}
				}
			},
			
			'visited': function (element) { /* can't do this without jiggery-pokery */ },
		
		// CSS Level 2
		
			'first-child': function (element) { return !XXX_DOM.getPreviousSibling(element); },
			
			'lang': function (element, code)
			{
				while (element && !element.getAttribute('lang'))
				{
					element = element.parentNode;
				}
				
				return element && XXX_String_Pattern.hasMatch(element.getAttribute('lang'), '^' + code, 'i');
			},
		
		// CSS Level 3
						
			'contains': function (element, text)
			{
				text = new RegExp(XXX_DOM_CSSQuery.escapePattern(XXX_String.removeQuotes(text)));
				
				return text.test(XXX_DOM.getTextContent(element));
			},
			
			'root': function (element) { return element == XXX_DOM.getDocument(element).documentElement; },
			
			'empty': function (element)
			{
				var node, i;
				for (i = 0; (node = element.childNodes[i]); ++i)
				{
					if (XXX_DOM.genuineElement(node) || node.nodeType == 3)
					{
						return false;
					}
				}
				
				return true;
			},
			
			'last-child': function (element) { return !XXX_DOM.getNextSibling(element); },
			
			'only-child': function (element)
			{
				element = element.parentNode;
				return XXX_DOM.getFirstChild(element) == XXX_DOM.getLastChild(element);
			},
			
			'not': function (element, selector)
			{
				var negated = XXX_DOM_CSSQuery.query(selector, XXX_DOM.getDocument(element));
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(negated); i < iEnd; ++i)
				{
					if (negated[i] == element)
					{
						return false;
					}
				}
				
				return true;
			},
			
			'nth-child': function (element, arguments)
			{
				return XXX_DOM.nthChild(element, arguments, function (element) { return XXX_DOM.getPreviousSibling(element); });
			},
			
			'nth-last-child': function (element, arguments)
			{
				return XXX_DOM.nthChild(element, arguments, function (element) { return XXX_DOM.getNextSibling(element); }, 'last');
			},
			
			'target': function (element) { return element.id == location.hash.slice(1); },
			
			// UI element states
			
			'checked': function (element) { return element.checked; },			
			'enabled': function (element) { return element.disabled === false; },			
			'disabled': function (element) { return element.disabled; },			
			'indeterminate': function (element) { return element.indeterminate; }			
	},
	
	attributeSelectors: [],
		
	cache: {},
	caching: false,
		
	IE_selectByID: function (results, parentElements, ID)
	{
		var matchedElement, i, iEnd, j, jEnd;
		
		for (i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(parentElements); i < iEnd; ++i)
		{
			if (matchedElement = parentElements[i].all.item(ID))
			{
				jEnd = XXX_Array.getFirstLevelItemTotal(matchedElement);
				
				if (matchedElement.id == ID)
				{
					results.push(matchedElement);
				}
				else if (jEnd != null)
				{
					for (j = 0; j < jEnd; ++j)
					{
						if (matchedElement[j].id == ID)
						{
							results.push(matchedElement[j]);
						}
					}
				}
			}
		}
		
		return results;
	},
	
	// the following functions allow querying of the DOM using CSS selectors
	query: function (selector, parentElements)
	{
		var matchedElements = [];
		var useCache = this.caching && !parentElements;
		var baseElements = (parentElements) ? XXX_Type.isNumericArray(parentElements) ? parentElements : [parentElements] : [document];
		
		// process comma separated selectors
		var selectors = XXX_String_Pattern.splitToArray(XXX_DOM_CSSQuery_Selector.parse(selector), '\\s*,\\s*', ''), i, iEnd;
		
		for (i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(selectors); i < iEnd; ++i)
		{			
			// convert the selector to a stream
			selector = XXX_DOM_CSSQuery_Selector.convertToParts(selectors[i]);
			
						
			// faster chop if it starts with ID (MSIE only)
			if (XXX_HTTP_Browser.IE_WIN && XXX_Array.joinValuesToString(XXX_Array.getPart(selector, 0, 3)) == ' *#')
			{
				selector = XXX_Array.getPart(selector, 2);
				
				parentElements = this.IE_selectByID([], baseElements, selector[1]);
			}
			else
			{
				parentElements = baseElements;
			}
						
			// process the stream
			var j = 0, jEnd = XXX_Array.getFirstLevelItemTotal(selector), token, filter, customArguments, cacheSelector = '';
			while (j < jEnd)
			{
				token = selector[j++];
				filter = selector[j++];
				cacheSelector += token + filter;
				
				// some pseudo-classes allow arguments to be passed
				//  e.g. nth-child(even)
				customArguments = '';
				if (selector[j] == '(')
				{
					while (selector[j++] != ')' && j < jEnd)
					{
						customArguments += selector[j];
					}
					
					customArguments = XXX_Array.getPart(customArguments, 0, -1);
					cacheSelector += '(' + customArguments + ')';
				}
				
				// process a token/filter pair use cached results if possible
				parentElements = (useCache && this.cache[cacheSelector]) ? this.cache[cacheSelector] : this.filterMatchingElements(parentElements, token, filter, customArguments);
				
				if (useCache)
				{
					this.cache[cacheSelector] = parentElements;
				}
			}
			
			matchedElements = XXX_Array.appendArray(matchedElements, parentElements);
		}
		
		return matchedElements;
	},
	
	clearCache: function (selector)
	{
		if (selector)
		{
			selector = XXX_Array.joinValuesToString(XXX_DOM_CSSQuery_Selector.convertToParts(selector));
			
			delete this.cache[selector];
		}
		else
		{
			this.cache = {};
		}
	},
	
	// -----------------------------------------------------------------------
	// query support
	// -----------------------------------------------------------------------
	
	// select a set of matching elements.
	// "from" is an array of elements.
	// "token" is a character representing the type of filter
	//  e.g. ">" means child selector
	// "filter" represents the tag name, id or class name that is being selected
	// the function returns an array of matching elements
		
	filterMatchingElements: function (parentElements, token, filter, customArguments)
	{
		if (XXX_String_Pattern.hasMatch(filter, '\\|', ''))
		{
			filter = XXX_String_Pattern.splitToArray(filter, '\\|','');
			customArguments = filter[0];
			filter = filter[1];
		}
		
		var results = [];
		
		if (XXX_DOM_CSSQuery.selectors[token])
		{
			XXX_DOM_CSSQuery.selectors[token](results, parentElements, filter, customArguments);
		}
		
		return results;
	}
};

var debug = [];
	