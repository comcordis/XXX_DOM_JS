
/*
http://www.quirksmode.org/dom/events/index.html


Events maintain the this reference to the object they are attached to, event reference is also constant, all cross-browser


* When using links with events, preventDefault and returning false will block the default behavior


So either stop propagation/bubbling in the children events, OR check the target in the parent

*/

var XXX_DOM_NativeEventDispatcher = function ()
{
	function fixEvent (nativeEvent)
	{
		// add W3C standard event methods
		nativeEvent.preventDefault = fixEvent.preventDefault;
		nativeEvent.stopPropagation = fixEvent.stopPropagation;
		
		return nativeEvent;
	}
	
	// Fixes the propagation to href="#" and stops it, which in turn avoids page jumping to the top, (should be with the click eventListener, as well as mousedown / up)
	fixEvent.preventDefault = function ()
	{
		this.returnValue = false;
	};
	// Fixes the propagation to parent element nodes
	fixEvent.stopPropagation = function ()
	{
		this.cancelBubble = true;
	};
	
	function removeEventListeners ()
	{
		if (!window.removeEventListener)
		{
			var elems = document.getElementsByTagName("*");
			
			for (var i = 0; i < elems.length; ++i)
			{
				delete elems[i]._XXX_DOM_NativeEventDispatcher_eventListeners;
			}
		}
	}
	
	// returns the target of an event (make sure to pass the correct event object)
	function getTarget (nativeEvent)
	{
		if (!nativeEvent)
		{
			return null;
		}
		
		var target = nativeEvent.target || nativeEvent.srcElement;
		
		// defeat Safari bug, originally match NT_TEXT
		if (target && target.nodeType == 3)
		{
			target = target.parentNode;	
		}
		
		return target;
	}
	
	function dispatchEventToListeners (nativeEvent)
	{
		var returnValue;
		
		// grab the event object (IE uses a global event object)
		// .parentWindow part is for dealing with multiple windows/frames in IE
		nativeEvent = nativeEvent || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
		
		// get a reference to the hash table of event eventListeners
		var eventListeners = this._XXX_DOM_NativeEventDispatcher_eventListeners[nativeEvent.type];
		
		// execute each event eventListener
		for (var i in eventListeners)
		{
			if (eventListeners[i])
			{
				// make the eventListener a method of the element so the value of |this| will be correct
				this._XXX_DOM_NativeEventDispatcher_dispatchEventToListener = eventListeners[i];
				
				returnValue = this._XXX_DOM_NativeEventDispatcher_dispatchEventToListener(nativeEvent);
				
				// the first eventListener returning false will cancel the remaining eventListeners for that type of event
				if (returnValue === false)
				{
					break;
				}
			}
		}
		
		if (this._XXX_DOM_NativeEventDispatcher_dispatchEventToListener)
		{
			this._XXX_DOM_NativeEventDispatcher_dispatchEventToListener = undefined;
			
			// Use try catch for IE bug
			try
			{
				delete this._XXX_DOM_NativeEventDispatcher_dispatchEventToListener;
			}
			catch (nativeException) {}
		}
		
		if (nativeEvent.type == 'unload' && (this === window || this === document.body))
		{
			removeEventListeners();
		}
		
		return returnValue;
	}
	
	function addEventListener (element, type, eventListener)
	{
		element = XXX_DOM.get(element);
		
		type = XXX_String.convertToLowerCase(type);
		
		if (type == 'mousewheel' || type == 'mousescroll')
		{
			// Mozilla and others
			if (window.addEventListener)
			{
				 window.addEventListener('DOMMouseScroll', eventListener, false);
			}
			// Internet Explorer & Opera
			else
			{
				window.onmousewheel = eventListener;
				document.onmousewheel = eventListener;
			}
		}
		
		if (element.addEventListener)
		{
			element.addEventListener(type, eventListener, false);
		}
		else
		{
			// assign each event eventListener a unique ID
			if (!eventListener._XXX_DOM_NativeEventDispatcher_ID)
			{
				eventListener._XXX_DOM_NativeEventDispatcher_ID = ++addEventListener.eventCounter;
			}
			
			// create a hash table of event types for the element
			if (!element._XXX_DOM_NativeEventDispatcher_eventListeners)
			{
				element._XXX_DOM_NativeEventDispatcher_eventListeners = {};
			}
			
			// create a hash table of event eventListeners for each element/event pair
			var eventListeners = element._XXX_DOM_NativeEventDispatcher_eventListeners[type];
			
			if (!eventListeners)
			{
				eventListeners = element._XXX_DOM_NativeEventDispatcher_eventListeners[type] = {};
				
				// store the existing event eventListener (if there is one)
				if (element['on' + type])
				{
					eventListeners[0] = element['on' + type];
				}
				
				// assign a global event eventListener to do all the work
				element['on' + type] = dispatchEventToListeners;
			}
			
			// store the event eventListener in the hash table
			eventListeners[eventListener._XXX_DOM_NativeEventDispatcher_ID] = eventListener;
		}
	}
	
	// an event counter used to create unique IDs for eventListeners
	addEventListener.eventCounter = 0;
	
	
	/*
	To remove a listener, you cannot use anonymouse functions to pass to addEventListener.
	Instead store the function in a var or property before passing it to addEventListener.
	Then to remove it you pass the var or property.
	*/
	
	function removeEventListener (element, type, eventListener)
	{
		type = XXX_String.convertToLowerCase(type);
		
		if (element.removeEventListener)
		{
			element.removeEventListener(type, eventListener, false);
		}
		else
		{
			// delete the event eventListener from the hash table
			if (element._XXX_DOM_NativeEventDispatcher_eventListeners && element._XXX_DOM_NativeEventDispatcher_eventListeners[type])
			{
				delete element._XXX_DOM_NativeEventDispatcher_eventListeners[type][eventListener._XXX_DOM_NativeEventDispatcher_ID];
			}
		}
	}
		
	var result =
	{
		addEventListener: addEventListener,
		removeEventListener: removeEventListener,
		getTarget: getTarget
	};
	
	return	result;
}();
