
/*

TODO http://www.digitalmediaminute.com/article/1772/swapping-two-nodes-in-the-dom

TODO:


- javascript createElement vs innerHTML, The solution is quite simple: add the dynamically created element in the DOM tree before accessing any of the properties, not after.
- use innerHTML for reading, createElement for creating
*/


// Please note that there is a difference between an element and a node! An element can be a node, but node isn't necessarily an element.

var XXX_DOM =
{
	get: function (element)
	{
		return (!XXX_Type.isString(element)) ? element : (document.getElementById ? document.getElementById(element) : (document.all ? document.all(element) : false));
	},
	
	hasAttribute: function (element, attribute)
	{
		var result = false;
		
		attribute = XXX_String.convertToLowerCase(attribute);
		
		element = this.get(element);
		
		if (element.hasAttribute && element.hasAttribute(attribute))
		{
			result = true;	
		}
		
		if (!result)
		{
			if (element.getAttribute(attribute) || element[attribute])
			{
				result = true;	
			}
		}
		
		if (!result)
		{
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(element.attributes); i < iEnd; ++i)
			{
				if (XXX_String.convertToLowerCase(element.attributes[i].nodeName) == attribute)
				{
					result = true;
					break;
				}
			}
		}
		
		return result;
	},
	
	setAttribute: function (element, key, value)
	{
		element = this.get(element);
		
		element.setAttribute(key, value);
	},
			
	////////////////////
	// Creation
	////////////////////
	
	createElementNode: function (tag)
	{
		return document.createElement(tag);
	},
	createTextNode: function (text)
	{
		return document.createTextNode(text);
	},
	
	createHTMLNode: function (html)
	{
		var span = this.createElementNode('span');
		
		this.setContent(span, html);
		
		return span;
	},
	
	////////////////////
	// Add & Remove
	////////////////////
			
		remove: function (element)
		{
			element = this.get(element);
			return element.parentNode.removeChild(element);
		},
		
		removeChildNodes: function (element)
		{
			element = this.get(element);
			
			while (XXX_Array.getFirstLevelItemTotal(element.childNodes))
			{
				element.removeChild(element.childNodes[0]);
			}
			
			return true;
		},
			
		appendChildNode: function (parent, element)
		{
			parent = this.get(parent);
			element = this.get(element);
			
			parent.appendChild(element);
		},
		
		prependChildNode: function (parent, element)
		{
			parent = this.get(parent);
			element = this.get(element);
			
			parent.insertBefore(element, parent.childNodes[0]);
		},
		
		moveBeforeNode: function (element, offsetElement)
		{
			element = this.get(element);
			offsetElement = this.get(offsetElement);
			
			var elementParent = this.getParent(element);
			var offsetElementParent = this.getParent(offsetElement);
			
			if (elementParent)
			{
				elementParent.removeChild(element);
			}
			
			offsetElementParent.insertBefore(element, offsetElement);
		},
		
		moveAfterNode: function (element, offsetElement)
		{
			element = this.get(element);
			offsetElement = this.get(offsetElement);
		
			var elementParent = this.getParent(element);
			var offsetElementParent = this.getParent(offsetElement);
			
			if (elementParent)
			{
				elementParent.removeChild(element);
			}
			
			var nextSibling = this.getNextSibling(offsetElement);
			
			if (this.genuineElement(nextSibling))
			{
				offsetElementParent.insertBefore(element, nextSibling);
			}
			else
			{
				offsetElementParent.appendChild(element);
			}
		},
		
		makeOrphan: function (element)
		{
			element = this.get(element);
			
			elementParent = this.getParent(element);
			
			if (elementParent)
			{
				elementParent.removeChild(element);
			}
		},
		
		swapNodes: function (element1, element2)
		{
			element1 = this.get(element1);
			element2 = this.get(element2);
			
			element1Parent = this.getParent(element1);
			element2Parent = this.getParent(element2);
			
			element1NextSibling = this.getNextSibling(element1);
			element2NextSibling = this.getNextSibling(element2);
			
			if (element1Parent)
			{
				element1Parent.removeChild(element1);
			}
			
			if (element2Parent)
			{
				element2Parent.removeChild(element2);
			}
					
			if (this.genuineElement(element1NextSibling))
			{
				element1Parent.insertBefore(element2, element1NextSibling);
			}
			else
			{
				element1Parent.appendChild(element2);
			}
			
			if (this.genuineElement(element2NextSibling))
			{
				element2Parent.insertBefore(element1, element2NextSibling);
			}
			else
			{
				element2Parent.appendChild(element1);
			}
		},
		
		becomeParentOf: function ()
		{
			// TODO
		},
	
	
	////////////////////
	// ID
	////////////////////
	
	getID: function (element)
	{
		element = this.get(element);
		
		return element.id;
	},
	setID: function (element, ID)
	{
		element = this.get(element);
		
		element.id = ID;
	},
		
	////////////////////
	// Content
	////////////////////
	
	setInner: function (element, data)
	{			
		element = this.get(element);
		
		element.innerHTML = data;
	},
	prependInner: function (element, data)
	{
		element = this.get(element);
		element.innerHTML = data + element.innerHTML;
	},
	appendInner: function (element, data)
	{
		element = this.get(element);
		element.innerHTML += data;
	},
		
	getInner: function (element)
	{
		element = this.get(element);
		return element.innerHTML;
	},
		
	swapInner: function (element, element2)
	{
		element = this.get(element);
		element2 = this.get(element2);
		
		var temp = element.innerHTML;
		
		element.innerHTML = element2.innerHTML;
		element2.innerHTML = temp;
	},
	
	removeContent: function (element)
	{
		element = this.get(element);
		
		this.removeChildNodes(element);
	},
	
	setContent: function (element, content)
	{
		element = this.get(element);
		
		if (XXX_Type.isElementNode(content) || XXX_Type.isTextNode(content))
		{
			this.removeChildNodes(element);
			
			element.appendChild(content);
		}
		else if (XXX_Type.isArray(content))
		{
			this.removeChildNodes(element);
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(content); i < iEnd; ++i)
			{
				if (XXX_Type.isElementNode(content[i]) || XXX_Type.isTextNode(content[i]))
				{
					element.appendChild(content[i]);
				}
				else
				{
					element.innerHTML += content[i];
				}
			}
		}
		else
		{
			element.innerHTML = content;
		}
	},
	
	addContent: function (element, content)
	{
		element = this.get(element);
		
		if (XXX_Type.isElementNode(content) || XXX_Type.isTextNode(content))
		{
			element.appendChild(content);
		}
		else if (XXX_Type.isArray(content))
		{
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(content); i < iEnd; ++i)
			{
				if (XXX_Type.isElementNode(content[i]) || XXX_Type.isTextNode(content[i]))
				{
					element.appendChild(content[i]);
				}
				else
				{
					element.innerHTML += content[i];
				}
			}
		}
		else
		{
			element.innerHTML += content;
		}
	},
	
	////////////////////
	// Relations
	////////////////////
	
	// Element within element2
	isDescendant: function (element, element2)
	{
		element = this.get(element);
		element2 = this.get(element2);
		
		var parents = [];
		
		var parentNode = element;
		
		var result = false;
		
		while (parentNode)
		{
			parentNode = parentNode.parentNode;
			
			if (parentNode && parentNode === element2)
			{
				result = true;
			}
		}
				
		return result;
	},
		
	// Element containing element2
	isAncestor: function (element, element2)
	{
		return this.isDescendant(element2, element);
	},
	/*
	getChildren: function (element)
	{
		element = this.get(element);
		
		var childNodes = element.childNodes;
		
		var children = [];
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(childNodes); i < iEnd; ++i)
		{
			if (childNodes[i].nodeType == 1)
			{
				children.push(childNodes[i]);	
			}
		}
		
		return children;
	},
	*/
	getElementParent: function (element)
	{
		element = this.get(element);
		
		var parentNode = element;
		
		var result = false;
		
		while (parentNode)
		{
			parentNode = parentNode.parentNode;
			
			if (XXX_Type.isElement(parentNode))
			{
				result = parentNode;
				break;
			}
		}
				
		return result;
	},
	
	getParent: function (element)
	{
		return this.getElementParent(element);
	},
		
	/////////////////////////
	//
	// hitTest
	//
	/////////////////////////
	
	// Only works with rectangular shapes... check if they overlap/hit eachother
	
	hitTest: function (element, element2)
	{
		element = this.get(element);
		element2 = this.get(element2);
		
		var elementPosition = XXX_CSS_Position.getRelativeToPage(element);
		var element2Position = XXX_CSS_Position.getRelativeToPage(element2);
		
		var elementSize = XXX_CSS_Size.get(element);
		var element2Size = XXX_CSS_Size.get(element2);
		
		var horizontalHit = XXX_Calculate.rangeHitTest(elementPosition.x, elementPosition.x + elementSize.width, element2Position.x, element2Position.x + element2Size.width);
		var verticalHit = XXX_Calculate.rangeHitTest(elementPosition.y, elementPosition.y + elementSize.height, element2Position.y, element2Position.y + element2Size.height);
		
		var result = horizontalHit && verticalHit;
		
		return result;
	},
	
	
	// IE5/6 includes comments in it's elements collections. So we have to check for this. the test is tagName != "!".
	genuineElement: function (element)
	{
		return (element && element.nodeType == 1 && element.tagName != '!') ? element : null;
	},
	
	getPreviousSibling: function (element)
	{
		while (element && (element = element.previousSibling) && !this.genuineElement(element)) continue;
		
		return element;
	},
	
	getNextSibling: function (element)
	{
		while (element && (element = element.nextSibling) && !this.genuineElement(element)) continue;
		
		return element;
	},
	
	getFirstChild: function (element)
	{
		return this.genuineElement(element.firstChild) || this.getNextSibling(element.firstChild);
	},
	
	getLastChild: function (element)
	{
		return this.genuineElement(element.lastChild) || this.getPreviousSibling(element.lastChild);
	},
	
	getChildren: function (element)
	{
		var childElements = [];
		element = this.getFirstChild(element);
		
		while (element)
		{
			childElements.push(element);
			element = this.getNextSibling(element);
		}
		
		return childElements;
	},
	
	// Return the element's containing document
	getDocument: function (element)
	{
		return element.ownerDocument || element.document;
	},
	
	// <html>
	getHTML: function ()
	{
		return document.documentElement;
	},
	
	// <body>
	getBody: function ()
	{
		return document.body;
	},
	
	getByTagName: function (element, tagName, nameSpace)
	{
		var result;
		
		if (XXX_HTTP_Browser.IE_WIN)
		{
			result = (tagName == '*' && element.all) ? element.all : element.getElementsByTagName(tagName);
		}
		else
		{
			result = nameSpace ? element.getElementsByTagNameNS('*', tagName) : element.getElementsByTagName(tagName);
		}
		
		return result;
	},
	
	compareNameSpace: function (element, nameSpace)
	{
		var result;
		
		if (XXX_HTTP_Browser.IE_WIN)
		{
			result = !nameSpace || (nameSpace == '*') || (element.scopeName == nameSpace);
		}
		else
		{
			result = !nameSpace || (nameSpace == "*") || (element.prefix == nameSpace);
		}
		
		return result;
	},
	
	isXML: function (element)
	{
		var result;
		
		var tempDocument = XXX_DOM.getDocument(element);
		
		if (XXX_HTTP_Browser.IE_WIN)
		{
			result = (typeof tempDocument.mimeType == 'unknown') ? XXX_String_Pattern.hasMatch(tempDocument.URL, '\\.xml$', 'i') : Boolean(tempDocument.mimeType == 'XML Document');		
		}
		else
		{
			if (document.contentType)
			{
				result = XXX_String_Pattern.hasMatch(tempDocument.contentType, 'xml', 'i');
			}
			else
			{
				result = tempDocument.documentElement.tagName != 'HTML';
			}
		}
		
		return result;
	},
	
	getTextContent: function (element)
	{
		var result;
		
		if (XXX_HTTP_Browser.IE_WIN)
		{
			result = element.innerText;
		}
		else
		{
			;
			
			// mozilla || opera || other
			result = element.textContent || element.innerText || this.getTextContentSub(element);
		}
		
		return result;
	},
	
	getTextContentSub: function (element)
	{
		var textContent = '', node, i;
		
		for (i = 0; (node = element.childNodes[i]); ++i)
		{
			switch (node.nodeType)
			{
				case 11: // document fragment
				case 1:
					textContent += _getTextContent(node);
					break;
				case 3:
					textContent += node.nodeValue;
					break;
			}
		}
		
		return textContent;
	},
	
	compareTagName: function (element, tagName, nameSpace)
	{
		if (tagName == '*')
		{
			return this.genuineElement(element);
		}
		
		if (!this.compareNameSpace(element, nameSpace))
		{
			return false;
		}
		
		if (!this.isXML(element))
		{
			tagName = XXX_String.convertToUpperCase(tagName);
		}
		
		return element.tagName == tagName;
	},
	
	nthChild: function (element, childSpecification, traverseCallback, mode)
	{
		switch (childSpecification)
		{
			case 'n':
				return true;
				break;
			case 'even':
				childSpecification = '2n';
				break;
			case 'odd':
				childSpecification = '2n+1';
				break;
		}
	
		var elementChildren = XXX_DOM.getChildren(element.parentNode);
		
		//	It was just a number (no 'n')
		if (XXX_Type.isNumber(childSpecification))
		{
			return this.checkIndexSub(childSpecification);
		}
	
		childSpecification = XXX_String.splitToArray(childSpecification, 'n');
		
		var multiplier = XXX_Type.makeInteger(childSpecification[0]);
		var step = XXX_Type.makeInteger(childSpecification[1]);
	
		if ((!XXX_Type.isNumber(multiplier) || multiplier == 1) && step === 0)
		{
			return true;
		}
		
		if (multiplier === 0 && XXX_Type.isNumber(step))
		{
			return checkIndexSub(step);
		}
		
		if (!XXX_Type.isNumber(step))
		{
			step = 0;
		}
	
		var count = 1;
		while (element = traverseCallback(element))
		{
			++count;
		}
	
		if (!XXX_Type.isNumber(multiplier) || multiplier == 1)
		{
			return (mode == 'last') ? (count <= step) : (step >= count);
		}
	
		return (count % multiplier) == step;
	},
	
	checkIndexSub: function (index)
	{
		var index = (mode == 'last') ? elementChildren.length - index : index - 1;
		
		return elementChildren[index] == element;
	}
};