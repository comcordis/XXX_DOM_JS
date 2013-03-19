var XXX_DOM_DialogVisibility = 
{
	counter: 0,
	dialogs: [],
	sequence: [],
	
	initialize: function ()
	{
		/*XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'mouseDown', function (nativeEvent)
		{
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});*/
		
		XXX_DOM_NativeEventDispatcher.addEventListener(XXX_DOM.getBody(), 'click', function (nativeEvent)
		{
			XXX_DOM_DialogVisibility.checkIfDialogsNeedToBeHidden(nativeEvent);
		});
	},
	
	// Direct or propagated click outside dialogs...
	checkIfDialogsNeedToBeHidden: function (nativeEvent)
	{
		var length = XXX_Array.getFirstLevelItemTotal(this.sequence);
		
		if (length)
		{		
			var lastIndex = this.sequence[length - 1];
					
			var XXX_Dialog_instance = this.dialogs[lastIndex];
					
			if (!XXX_DOM.isAncestor(XXX_Dialog_instance.getOuterElementNode(), XXX_DOM_NativeEventDispatcher.getTarget(nativeEvent)))
			{
				XXX_Dialog_instance.hide();
			}
		}
	},
	
	hideAll: function ()
	{
		var length = XXX_Array.getFirstLevelItemTotal(this.sequence);
		
		if (length)
		{
			for (var i = 0, iEnd = length; i < iEnd; ++i)
			{
				var index = this.sequence[i];
				
				var XXX_Dialog_instance = this.dialogs[index];
				
				XXX_Dialog_instance.hide();
			}
		}
	},
	
	dialogHidden: function (index)
	{
		if (XXX_Array.hasValue(this.sequence, index))
		{
			var newSequence = [];
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.sequence); i < iEnd; ++i)
			{
				if (this.sequence[i] != index)
				{
					newSequence.push(this.sequence[i]);
				}
			}
			
			this.sequence = newSequence;
		}
	},
	
	dialogShown: function (index, hideAll)
	{
		if (!XXX_Array.hasValue(this.sequence, index))
		{
			this.sequence.push(index);
		}
	},
	
	attachDialog: function (dialog)
	{
		var index = this.counter++;
		
		(dialog.getOuterElementNode())._XXX_index = index;
		this.dialogs[index] = dialog;
		
		return index;
	}
};

XXX_DOM_Ready.addEventListener(function ()
{
	XXX_DOM_DialogVisibility.initialize();
});