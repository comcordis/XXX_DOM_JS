
//////////////////////////////////////////////////
//////////////////////////////////////////////////
//
// XXX_DOM_NativeHelpers
//
//////////////////////////////////////////////////
//////////////////////////////////////////////////

	var XXX_DOM_NativeHelpers =
	{
		nativeFrame:
		{
			// name string or element
			get: function (nativeFrame)
			{
				return (nativeFrame.tagName && (XXX_String.convertToLowerCase(nativeFrame.tagName) === 'iframe' || XXX_String.convertToLowerCase(nativeFrame.tagName) === 'frame')) ? nativeFrame : window.frames[nativeFrame] ? window.frames[nativeFrame] : window[nativeFrame] ? window[nativeFrame] : false;
			},
			
			getBody: function (nativeFrame)
			{
				var result = false;
				
				if (nativeFrame)
				{
					try
					{
						if (nativeFrame.document)
						{
							if (nativeFrame.document.body)
							{
								result = nativeFrame.document.body;
							}							
							else if (nativeFrame.document.compatMode && nativeFrame.document.compatMode != 'BackCompat')
							{
								result = nativeFrame.document.documentElement;
							}							
							else if (nativeFrame.document.getElementsByTagName('body')[0])
							{
								result = nativeFrame.document.getElementsByTagName('body')[0];
							}
						}
						else
						{						
							if (nativeFrame.contentDocument && nativeFrame.contentDocument.body)
							{
								nativeFrame.contentDocument.body;
							}							
							else if (nativeFrame.contentWindow && nativeFrame.contentWindow.document && nativeFrame.contentWindow.document.body)
							{
								nativeFrame.contentWindow.document.body;
							}
						}
						
					}
					catch (exception)
					{
						// The nativeFrame probably contains a file from a different (sub-)domain, which prevents it from being read as a security measure..
					}
				}
				
				return result;
			},
			
			getBodyJSON: function (nativeFrame)
			{
				var result = false;
				
				var body = XXX_DOM_NativeHelpers.nativeFrame.getBody(nativeFrame);
			
				if (body)
				{
					var content = XXX_DOM.getInner(body);
					
					if (content)
					{
						// Filter out call back scripts etc.
						
						// Some browsers use lower case tags
						var scriptPosition = XXX_String.findFirstPosition(content, '<script');
						
						if (scriptPosition == -1)
						{
							// Some browsers use upper case tags
							scriptPosition = XXX_String.findFirstPosition(content, '<SCRIPT');
						}
						
						if (scriptPosition > -1)
						{
							content = XXX_String.getPart(content, 0, scriptPosition);				
						}
												
						content = XXX_String_JSON.decode(content);
						
						result = content;
					}
				}
				
				return result;
			},
			
			makeEditable: function (nativeFrame)
			{
				if (document.all)
				{
					nativeFrame.contentWindow.document.designMode = 'On';
				}
				
				nativeFrame.contentWindow.document.documentElement.contentEditable = true;
			},
			
			setURI: function (nativeFrame, uri)
			{
				nativeFrame.src = uri;
			}
		},
		
		nativeForm:
		{
			// name string or element
			get: function (nativeForm)
			{
				return (nativeForm.tagName && XXX_String.convertToLowerCase(nativeForm.tagName) === 'form') ? nativeForm : document.forms[nativeForm] ? document.forms[nativeForm] : document[nativeForm] ? document[nativeForm] : false;
			},
			
			getTransportMethod: function (nativeForm)
			{
				var result = false;
				
				if (nativeForm)
				{
					var transportMethod = nativeForm.method;
					transportMethod = XXX_String.convertToLowerCase(transportMethod);
					
					if (transportMethod == 'get')
					{
						result = 'uri';
					}
					else if (transportMethod == 'post')
					{
						result = 'body';
					}
				}
				
				return result;
			},
			
			setTransportMethod: function (nativeForm, transportMethod)
			{
				if (transportMethod == 'body' || transportMethod == 'uri')
				{
					if (transportMethod == 'body')
					{
						nativeForm.method = 'POST';
					}
					else
					{
						nativeForm.method = 'GET';
					}
				}
			},
			
			setTransportFormat: function (nativeForm, transportFormat)
			{
				transportFormat = XXX_Default.toOption(transportFormat, ['multipart/form-data', 'application/x-www-form-urlencoded', 'text/plain'], 'application/x-www-form-urlencoded');
			
				nativeForm.enctype = transportFormat;
				nativeForm.encoding = transportFormat;
			},
			
			getSubmitURI: function (nativeForm)
			{
				var result = false;
			
				if (nativeForm)
				{
					result = nativeForm.action;
				}
				
				return result;
			},
			
			setSubmitURI: function (nativeForm, submitURI)
			{
				nativeForm.action = submitURI;
			},
			
			setTarget: function (nativeForm, target)
			{
				nativeForm.target = target;
			},
						
			setAcceptFileMIMETypes: function (nativeForm, acceptFileMIMETypes)
			{
				if (acceptFileMIMETypes && XXX_Type.isArray(acceptFileMIMETypes))
				{
					if (XXX_Array.getFirstLevelItemTotal(acceptFileMIMETypes) > 0)
					{
						acceptFileMIMETypes = XXX_Array.joinValuesToString(acceptFileMIMETypes, ',');
					}
					else
					{
						acceptFileMIMETypes = '';
					}
				}
				else
				{
					acceptFileMIMETypes = '';
				}
				
				nativeForm.accept = acceptFileMIMETypes;
			},
			
			getAcceptFileMIMETypes: function (nativeForm)
			{
				var acceptFileMIMETypes = nativeForm.accept;
				
				acceptFileMIMETypes = XXX_String.splitToArray(acceptFileMIMETypes, ',');
				
				return acceptFileMIMETypes;
			},
			
			getInputs: function (nativeForm)
			{
				nativeForm = XXX_DOM_NativeHelpers.nativeForm.get(nativeForm);
				
				var result = {};
					
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeForm.elements); i < iEnd; ++i)
				{
					var input = nativeForm.elements[i];			
					var type = XXX_String.convertToLowerCase(input.tagName);			
					var originalName = input.name;			
					var name = originalName;
					
					var multiple = false;
					
					if (input.multiple)
					{
						multiple = true;	
					}
					
					if (XXX_String.endsWith(originalName, '[]'))
					{
						name = XXX_String.getPart(originalName, 0, -2);
						
						multiple = true;
					}
					
					if (type === 'input' || type === 'textarea' || type === 'select' || type === 'button')
					{			
						if (type === 'input' || type === 'button')
						{
							type = input.type;
						}
						
						switch (type)
						{
							case 'text':
								type = 'nativeCharacterLineInput';
								break;
							case 'password':
								type = 'nativeMaskedCharacterLineInput';
								break;
							case 'hidden':
								type = 'nativeHiddenVariableInput';
								break;
							case 'file':
								type = 'nativeFileUploadInput';
								break;
							case 'textarea':
								type = 'nativeCharacterLinesInput';
								break;
							case 'radio':
								type = 'nativeExclusiveOptionSwitchListInput';
								break;
							case 'checkbox':
								type = 'nativeFreeOptionSwitchListInput';
								break;
							case 'select':
								if (multiple)
								{
									type = 'nativeFreeOptionListBoxInput';
								}
								else
								{
									type = 'nativeExclusiveOptionListBoxInput';
								}
								break;
							case 'submit':
							case 'reset':
							case 'button':
								type = 'nativeButton';
								break;
						}
						
						if (XXX_Type.isObject(result[name]))
						{
							if (type == 'nativeFileUploadInput' || type == 'nativeExclusiveOptionSwitchListInput' || type == 'nativeFreeOptionSwitchListInput')
							{
								result[name].inputs.push(input);
							}
						}
						else
						{
							result[name] = {};
							
							result[name].name = name;
							result[name].type = type;
							
							if (type == 'nativeFileUploadInput' || type == 'nativeExclusiveOptionSwitchListInput' || type == 'nativeFreeOptionSwitchListInput')
							{
								result[name].inputs = [];
								result[name].inputs.push(input);
							}
							else
							{
								result[name].input = input;
							}
						}
					}
				}
				
				return result;
			},
			
			getInputsByName: function (nativeForm, name)
			{
				var inputs = XXX_DOM_NativeHelpers.nativeForm.getInputs(nativeForm);
				
				var input = false;
				
				for (var tempInputName in inputs)
				{
					var tempInput = inputs[tempInputName];
					
					if (tempInput.name == name)
					{
						input = tempInput;
					}
				}
				
				return input;
			}
		},
		
		nativeButton:
		{
			// Disabled
			
				setDisabled: function (nativeButton, disabled)
				{
					nativeButton.disabled = disabled ? true : false;	
				},
				
				enable: function (nativeButton)
				{
					nativeButton.disabled = false;	
				},
				
				disable: function (nativeButton)
				{
					nativeButton.disabled = true;	
				},
							
				isDisabled: function (nativeButton)
				{
					return nativeButton.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeButton, editable)
				{
					nativeButton.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeButton)
				{
					nativeButton.readOnly = false;
				},
				
				makeReadOnly: function (nativeButton)
				{
					nativeButton.readOnly = true;
				},
				
				isEditable: function (nativeButton)
				{
					return nativeButton.readOnly ? false: true;
				},
			
			// Focused
			
				setFocused: function (nativeButton, focused)
				{
					if (focused)
					{
						nativeButton.focus();
					}
					else
					{
						nativeButton.blur();
					}
				},
				
				focus: function (nativeButton)
				{
					nativeButton.focus();
				},
				
				blur: function (nativeButton)
				{
					nativeButton.blur();
				},
			
			// Click
			
			click: function (nativeButton)
			{
				nativeButton.click();
			},
			
			// Label
			
				getLabel: function (nativeButton)
				{
					var result = '';
					
					var value = nativeButton.value;
					var innerHTML = nativeButton.innerHTML;
					
					
					if (innerHTML)
					{
						result = innerHTML;
					}
					else if (value)
					{
						result = value;
					}
					
					return result;
				},
				
				setLabel: function (nativeButton, label)
				{
					nativeButton.value = label;
					nativeButton.innerHTML = label;
				},
			
			// Action
			
				setButtonAction: function (nativeButton, buttonAction)
				{
					if (buttonAction == 'custom' || buttonAction == 'submitForm' || buttonAction == 'resetForm')
					{
						if (buttonAction == 'custom')
						{
							nativeButton.type = 'normal';
						}
						else if (buttonAction == 'submitForm')
						{
							nativeButton.type = 'submit';
						}
						else if (buttonAction == 'resetForm')
						{
							nativeButton.type = 'reset';
						}
					}
				},
				
				getButtonAction: function (nativeButton)
				{
					var result = false;
					
					var buttonType = nativeButton.type;
					buttonType = XXX_String.convertToLowerCase(buttonType);
					
					if (buttonType == 'normal')
					{
						result = 'custom';
					}
					else if (buttonType == 'reset')
					{
						result = 'resetForm';
					}
					else if (buttonType == 'submit')
					{
						result = 'submitForm';
					}
					
					return result;
				}
		},
		
		nativeCharacterLineInput:
		{
			getNativeForm: function (nativeCharacterLineInput)
			{
				return nativeCharacterLineInput.form;
			},
			
			// Disabled
			
				setDisabled: function (nativeCharacterLineInput, disabled)
				{
					nativeCharacterLineInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeCharacterLineInput)
				{
					nativeCharacterLineInput.disabled = false;
				},
				
				disable: function (nativeCharacterLineInput)
				{
					nativeCharacterLineInput.disabled = true;
				},
				
				isDisabled: function (nativeCharacterLineInput)
				{
					return nativeCharacterLineInput.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeCharacterLineInput, editable)
				{
					nativeCharacterLineInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeCharacterLineInput)
				{
					nativeCharacterLineInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeCharacterLineInput)
				{
					nativeCharacterLineInput.readOnly = true;
				},
				
				isEditable: function (nativeCharacterLineInput)
				{
					return nativeCharacterLineInput.readOnly ? false: true;
				},
			
			// Focused
			
				setFocused: function (nativeCharacterLineInput, focused)
				{
					if (focused)
					{
						nativeCharacterLineInput.focus();
					}
					else
					{
						nativeCharacterLineInput.blur();
					}
				},
				
				focus: function (nativeCharacterLineInput)
				{
					nativeCharacterLineInput.focus();
				},
				
				blur: function (nativeCharacterLineInput)
				{
					nativeCharacterLineInput.blur();
				},
			
			// Character display
			
				setCharacterDisplay: function (nativeCharacterLineInput, characterDisplay)
				{
					if (!XXX_Array.hasValue(['plain', 'masked'], characterDisplay))
					{
						characterDisplay = 'plain';
					}
					
					nativeCharacterLineInput.type = characterDisplay == 'plain' ? 'text' : 'password';
				},
			
			// Align
			
				setAlign: function (nativeCharacterLineInput, align)
				{
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					XXX_CSS.setStyle(nativeCharacterLineInput, 'text-align', align);
				},
				
				getAlign: function (nativeCharacterLineInput)
				{
					var align = XXX_CSS.getStyle(nativeCharacterLineInput, 'text-align');
					
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					return align;
				},
			
			// Line character length
			
				setLineCharacterLength: function (nativeCharacterLineInput, lineCharacterLength)
				{
					if (XXX_Type.isPositiveInteger(lineCharacterLength))
					{				
						nativeCharacterLineInput.size = lineCharacterLength;
					}
				},
				
				getLineCharacterLength: function (nativeCharacterLineInput)
				{
					return nativeCharacterLineInput.size;
				},
			
			// Value
			
				setValue: function (nativeCharacterLineInput, value)
				{
					nativeCharacterLineInput.value = value;
				},
				
				getValue: function (nativeCharacterLineInput)
				{
					return nativeCharacterLineInput.value;
				}
		},
		
		
		nativeCharacterLinesInput:
		{
			// Disabled
			
				setDisabled: function (nativeCharacterLinesInput, disabled)
				{
					nativeCharacterLinesInput.disabled = disabled ? true : false;
				},
			
				enable: function (nativeCharacterLinesInput)
				{
					nativeCharacterLinesInput.disabled = false;
				},
				
				disable: function (nativeCharacterLinesInput)
				{
					nativeCharacterLinesInput.disabled = true;
				},
				
				isDisabled: function (nativeCharacterLinesInput)
				{
					return nativeCharacterLinesInput.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeCharacterLinesInput, editable)
				{
					nativeCharacterLinesInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeCharacterLinesInput)
				{
					nativeCharacterLinesInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeCharacterLinesInput)
				{
					nativeCharacterLinesInput.readOnly = true;
				},
				
				isEditable: function (nativeCharacterLinesInput)
				{
					return nativeCharacterLinesInput.readOnly ? false : true;
				},
			
			// Focused
			
				setFocused: function (nativeCharacterLinesInput, focused)
				{
					if (focused)
					{
						nativeCharacterLinesInput.focus();
					}
					else
					{
						nativeCharacterLinesInput.blur();
					}
				},
				
				focus: function (nativeCharacterLinesInput)
				{
					nativeCharacterLinesInput.focus();
				},
				
				blur: function (nativeCharacterLinesInput)
				{
					nativeCharacterLinesInput.blur();
				},
			
			// Line character length
			
				setLineCharacterLength: function (nativeCharacterLinesInput, lineCharacterLength)
				{
					if (XXX_Type.isPositiveInteger(lineCharacterLength))
					{				
						nativeCharacterLinesInput.cols = lineCharacterLength;
					}
				},
				
				getLineCharacterLength: function (nativeCharacterLinesInput)
				{
					return nativeCharacterLinesInput.cols;
				},
			
			// Lines
			
				setLines: function (nativeCharacterLinesInput, lines)
				{
					if (XXX_Type.isPositiveInteger(lines))
					{				
						nativeCharacterLinesInput.rows = lines;
					}
				},
				
				getLines: function (nativeCharacterLinesInput)
				{
					return nativeCharacterLinesInput.rows;
				},
			
			// Value
			
				setValue: function (nativeCharacterLinesInput, value)
				{
					nativeCharacterLinesInput.innerHTML = value;
					nativeCharacterLinesInput.value = value;
				},
				
				getValue: function (nativeCharacterLinesInput)
				{
					return nativeCharacterLinesInput.value || nativeCharacterLinesInput.innerHTML;
				}
		},
		
		nativeHiddenVariableInput:
		{
			// Disabled
			
				setDisabled: function (nativeHiddenVariableInput, disabled)
				{
					nativeHiddenVariableInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeHiddenVariableInput)
				{
					nativeHiddenVariableInput.disabled = false;
				},
				
				disable: function (nativeHiddenVariableInput)
				{
					nativeHiddenVariableInput.disabled = true;
				},
				
				isDisabled: function (nativeHiddenVariableInput)
				{
					return nativeHiddenVariableInput.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeHiddenVariableInput, editable)
				{
					nativeHiddenVariableInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeHiddenVariableInput)
				{
					nativeHiddenVariableInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeHiddenVariableInput)
				{
					nativeHiddenVariableInput.readOnly = true;
				},
				
				isEditable: function (nativeHiddenVariableInput)
				{
					return nativeHiddenVariableInput.readOnly ? false : true;
				},
			
			// Focused
			
				setFocused: function (nativeHiddenVariableInput, focused)
				{
					if (focused)
					{
						nativeHiddenVariableInput.focus();
					}
					else
					{
						nativeHiddenVariableInput.blur();
					}
				},
				
				focus: function (nativeHiddenVariableInput)
				{
					nativeHiddenVariableInput.focus();
				},
				
				blur: function (nativeHiddenVariableInput)
				{
					nativeHiddenVariableInput.blur();
				},
			
			// Value
				
				setValue: function (nativeHiddenVariableInput, value)
				{
					nativeHiddenVariableInput.value = value;
				},
				
				getValue: function (nativeHiddenVariableInput)
				{
					return nativeHiddenVariableInput.value;
				}
		},
		
		
		nativeExclusiveOptionSwitchInput:
		{
			// Disabled
			
				setDisabled: function (nativeExclusiveOptionSwitchInput, disabled)
				{
					nativeExclusiveOptionSwitchInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.disabled = false;
				},
				
				disable: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.disabled = true;
				},
				
				isDisabled: function (nativeExclusiveOptionSwitchInput)
				{
					return nativeExclusiveOptionSwitchInput.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeExclusiveOptionSwitchInput, editable)
				{
					nativeExclusiveOptionSwitchInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.readOnly = true;
				},
				
				isEditable: function (nativeExclusiveOptionSwitchInput)
				{
					return nativeExclusiveOptionSwitchInput.readOnly ? false : true;
				},
			
			// Focused
			
				setFocused: function (nativeExclusiveOptionSwitchInput, focused)
				{
					if (focused)
					{
						nativeExclusiveOptionSwitchInput.focus();
					}
					else
					{
						nativeExclusiveOptionSwitchInput.blur();
					}
				},
				
				focus: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.focus();
				},
				
				blur: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.blur();
				},
			
			// Value
			
				getValue: function (nativeExclusiveOptionSwitchInput)
				{
					return nativeExclusiveOptionSwitchInput.value;
				},
				
				setValue: function (nativeExclusiveOptionSwitchInput, value)
				{
					nativeExclusiveOptionSwitchInput.value = value;
				},
			
			// Selected
			
				setSelected: function (nativeExclusiveOptionSwitchInput, selected)
				{
					nativeExclusiveOptionSwitchInput.checked = selected ? true : false;
				},
				
				select: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.checked = true;
				},
				
				deselect: function (nativeExclusiveOptionSwitchInput)
				{
					nativeExclusiveOptionSwitchInput.checked = false;
				},
						
				isSelected: function (nativeExclusiveOptionSwitchInput)
				{
					return nativeExclusiveOptionSwitchInput.checked ? true : false;
				}
		},
		
		nativeFreeOptionSwitchInput:
		{
			// Disabled
		
				setDisabled: function (nativeFreeOptionSwitchInput, disabled)
				{
					nativeFreeOptionSwitchInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.disabled = false;
				},
				
				disable: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.disabled = true;
				},
				
				isDisabled: function (nativeFreeOptionSwitchInput)
				{
					return nativeFreeOptionSwitchInput.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeFreeOptionSwitchInput, editable)
				{
					nativeFreeOptionSwitchInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.readOnly = true;
				},
				
				isEditable: function (nativeFreeOptionSwitchInput)
				{
					return nativeFreeOptionSwitchInput.readOnly ? false : true;
				},
			
			// Focused
			
				setFocused: function (nativeFreeOptionSwitchInput, focused)
				{
					if (focused)
					{
						nativeFreeOptionSwitchInput.focus();
					}
					else
					{
						nativeFreeOptionSwitchInput.blur();
					}
				},
				
				focus: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.focus();
				},
				
				blur: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.blur();
				},
			
			// Value
			
				getValue: function (nativeFreeOptionSwitchInput)
				{
					return nativeFreeOptionSwitchInput.value;
				},
				
				setValue: function (nativeFreeOptionSwitchInput, value)
				{
					nativeFreeOptionSwitchInput.value = value;
				},
			
			// Selected
			
				setSelected: function (nativeFreeOptionSwitchInput, selected)
				{
					nativeFreeOptionSwitchInput.checked = selected ? true : false;
				},
				
				select: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.checked = true;
				},
				
				deselect: function (nativeFreeOptionSwitchInput)
				{
					nativeFreeOptionSwitchInput.checked = false;
				},
						
				isSelected: function (nativeFreeOptionSwitchInput)
				{
					return nativeFreeOptionSwitchInput.checked ? true : false;
				}
		},
		
		inputLabel:
		{
			// Native input ID
			
				setInputID: function (inputLabel, inputID)
				{
					inputLabel.setAttribute('for', inputID);
					inputLabel.htmlFor = inputID;
				},
				
				getInputID: function (inputLabel)
				{
					return inputLabel.htmlFor || inputLabel.getAttribute('for');
				},
			
			// Label
			
				setLabel: function (inputLabel, label)
				{
					XXX_DOM.setContent(inputLabel, label);
				},
				
				getLabel: function (inputLabel)
				{
					return XXX_DOM.getInner(inputLabel);
				}			
		},
		
		nativeExclusiveOptionListBoxInput:
		{
			// Disabled
			
				setDisabled: function (nativeExclusiveOptionListBoxInput , disabled)
				{
					nativeExclusiveOptionListBoxInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeExclusiveOptionListBoxInput)
				{
					nativeExclusiveOptionListBoxInput.disabled = false;
				},
				
				disable: function (nativeExclusiveOptionListBoxInput)
				{
					nativeExclusiveOptionListBoxInput.disabled = true;
				},
				
				isDisabled: function (nativeExclusiveOptionListBoxInput)
				{
					return nativeExclusiveOptionListBoxInput.disabled ? true : false;
				},
			
			// Editable
					
				setEditable: function (nativeExclusiveOptionListBoxInput, editable)
				{
					nativeExclusiveOptionListBoxInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeExclusiveOptionListBoxInput)
				{
					nativeExclusiveOptionListBoxInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeExclusiveOptionListBoxInput)
				{
					nativeExclusiveOptionListBoxInput.readOnly = true;
				},
				
				isEditable: function (nativeExclusiveOptionListBoxInput)
				{
					return nativeExclusiveOptionListBoxInput.readOnly ? false : true;
				},
			
			// Focused
					
				setFocused: function (nativeExclusiveOptionListBoxInput, focused)
				{
					if (focused)
					{
						nativeExclusiveOptionListBoxInput.focus();
					}
					else
					{
						nativeExclusiveOptionListBoxInput.blur();
					}
				},
				
				focus: function (nativeExclusiveOptionListBoxInput)
				{
					nativeExclusiveOptionListBoxInput.focus();
				},
				
				blur: function (nativeExclusiveOptionListBoxInput)
				{
					nativeExclusiveOptionListBoxInput.blur();
				},
			
			// Align
			
				setAlign: function (nativeExclusiveOptionListBoxInput, align)
				{
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					XXX_CSS.setStyle(nativeExclusiveOptionListBoxInput, 'text-align', align);
				},
				
				getAlign: function (nativeExclusiveOptionListBoxInput)
				{
					var align = XXX_CSS.getStyle(nativeExclusiveOptionListBoxInput, 'text-align');
					
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					return align;
				},
				
			// Options
					
				resetOptions: function (nativeExclusiveOptionListBoxInput)
				{
					while (nativeExclusiveOptionListBoxInput.options.length)
					{
						nativeExclusiveOptionListBoxInput.options[0] = null;
					}
				},
				
				addOption: function (nativeExclusiveOptionListBoxInput, option, align)
				{
					var option = new Option(option.textLabel, option.value, false, option.selected ? true : false);	
					
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					try
					{
						// Mozilla and others
						nativeExclusiveOptionListBoxInput.add(option, null);	
					}
					catch (exception)
					{
						// Internet Explorer
						nativeExclusiveOptionListBoxInput.add(option);
					}
					
					XXX_CSS.setStyle(option, 'text-align', align);
				},
				
				getOptions: function (nativeExclusiveOptionListBoxInput)
				{
					var options = [];
				
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeExclusiveOptionListBoxInput.options); i < iEnd; ++i)
					{
						// TODO html entities decode label
						var option =
						{
							textLabel: nativeExclusiveOptionListBoxInput.options[i].text,
							value: nativeExclusiveOptionListBoxInput.options[i].value,
							selected: nativeExclusiveOptionListBoxInput.options[i].selected
						};
						
						options.push(option);
					}
					
					return options;
				},
				
				getOptionValues: function (nativeExclusiveOptionListBoxInput)
				{
					var optionValues = [];
				
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeExclusiveOptionListBoxInput.options); i < iEnd; ++i)
					{			
						optionValues.push(nativeExclusiveOptionListBoxInput.options[i].value);
					}
					
					return optionValues;
				},
				
				getSelectedOptionValue: function (nativeExclusiveOptionListBoxInput)
				{
					var selectedOptionValue = false;
				
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeExclusiveOptionListBoxInput.options); i < iEnd; ++i)
					{	
						if (nativeExclusiveOptionListBoxInput.options[i].selected)
						{
							selectedOptionValue = nativeExclusiveOptionListBoxInput.options[i].value;
						}
					}
					
					return selectedOptionValue;
				},
				
				selectOptionByValue: function (nativeExclusiveOptionListBoxInput, optionValue)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeExclusiveOptionListBoxInput.options); i < iEnd; ++i)
					{
						if (nativeExclusiveOptionListBoxInput.options[i].value == optionValue)
						{
							nativeExclusiveOptionListBoxInput.options[i].selected = true;
						}
						else
						{
							nativeExclusiveOptionListBoxInput.options[i].selected = false;
						}
					}
				},
				
				deselectOptionByValue: function (nativeExclusiveOptionListBoxInput, optionValue)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeExclusiveOptionListBoxInput.options); i < iEnd; ++i)
					{
						if (nativeExclusiveOptionListBoxInput.options[i].value == optionValue)
						{
							nativeExclusiveOptionListBoxInput.options[i].selected = false;
						}
					}
				},
				
				deselectAllOptions: function (nativeExclusiveOptionListBoxInput)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeExclusiveOptionListBoxInput.options); i < iEnd; ++i)
					{
						nativeExclusiveOptionListBoxInput.options[i].selected = false;
					}
				}
		},
		
		nativeFreeOptionListBoxInput:
		{
			// Disabled
				
				setDisabled: function (nativeFreeOptionListBoxInput , disabled)
				{
					nativeFreeOptionListBoxInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeFreeOptionListBoxInput)
				{
					nativeFreeOptionListBoxInput.disabled = false;
				},
				
				disable: function (nativeFreeOptionListBoxInput)
				{
					nativeFreeOptionListBoxInput.disabled = true;
				},
				
				isDisabled: function (nativeFreeOptionListBoxInput)
				{
					return nativeFreeOptionListBoxInput.disabled ? true : false;
				},
			
			// Editable
				
				setEditable: function (nativeFreeOptionListBoxInput, editable)
				{
					nativeFreeOptionListBoxInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeFreeOptionListBoxInput)
				{
					nativeFreeOptionListBoxInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeFreeOptionListBoxInput)
				{
					nativeFreeOptionListBoxInput.readOnly = true;
				},
				
				isEditable: function (nativeFreeOptionListBoxInput)
				{
					return nativeFreeOptionListBoxInput.readOnly ? false : true;
				},
			
			// Focused
			
				setFocused: function (nativeFreeOptionListBoxInput, focused)
				{
					if (focused)
					{
						nativeFreeOptionListBoxInput.focus();
					}
					else
					{
						nativeFreeOptionListBoxInput.blur();
					}
				},
				
				focus: function (nativeFreeOptionListBoxInput)
				{
					nativeFreeOptionListBoxInput.focus();
				},
				
				blur: function (nativeFreeOptionListBoxInput)
				{
					nativeFreeOptionListBoxInput.blur();
				},
			
			// Align
			
				setAlign: function (nativeFreeOptionListBoxInput, align)
				{
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					XXX_CSS.setStyle(nativeFreeOptionListBoxInput, 'text-align', align);
				},
				
				getAlign: function (nativeFreeOptionListBoxInput)
				{
					var align = XXX_CSS.getStyle(nativeFreeOptionListBoxInput, 'text-align');
					
					if (!XXX_Array.hasValue(['left', 'center', 'right'], align))
					{
						align = 'left';
					}
					
					return align;
				},
				
				
			// Rows
			
				setRows: function (nativeFreeOptionListBoxInput, rows)
				{
					if (!XXX_Type.isPositiveInteger(rows))
					{
						rows = 3;
					}
					
					nativeFreeOptionListBoxInput.rows = rows;
				},
				
				getRows: function (nativeFreeOptionListBoxInput)
				{
					var rows = nativeFreeOptionListBoxInput.rows;
					
					if (!XXX_Type.isPositiveInteger(rows))
					{
						rows = 3;
					}
					
					return rows;
				},
				
			// Options
			
				resetOptions: function (nativeFreeOptionListBoxInput)
				{
					return XXX_DOM_NativeHelpers.nativeDropDownOptionList.resetOptions(nativeFreeOptionListBoxInput);
				},
				
				addOption: function (nativeFreeOptionListBoxInput, option, align)
				{
					return XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.addOption(nativeFreeOptionListBoxInput, option, align);
				},
				
				getOptions: function (nativeFreeOptionListBoxInput)
				{
					return XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.getOptions(nativeFreeOptionListBoxInput);
				},
				
				getOptionValues: function (nativeFreeOptionListBoxInput)
				{
					var optionValues = [];
				
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{			
						optionValues.push(nativeFreeOptionListBoxInput.options[i].value);
					}
					
					return optionValues;
				},
				
				getSelectedOptionValues: function (nativeFreeOptionListBoxInput)
				{
					var selectedOptionValues = [];
					
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{	
						if (nativeFreeOptionListBoxInput.options[i].selected)
						{
							selectedOptionValues.push(nativeFreeOptionListBoxInput.options[i].value);
						}
					}
					
					return selectedOptionValues;
				},
				
				selectOptionByValue: function (nativeFreeOptionListBoxInput, optionValue)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{
						if (nativeFreeOptionListBoxInput.options[i].value == optionValue)
						{
							nativeFreeOptionListBoxInput.options[i].selected = true;
						}
					}
				},
				
				deselectOptionByValue: function (nativeFreeOptionListBoxInput, optionValue)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{
						if (nativeFreeOptionListBoxInput.options[i].value == optionValue)
						{
							nativeFreeOptionListBoxInput.options[i].selected = false;
						}
					}
				},
				
				selectAllOptions: function (nativeFreeOptionListBoxInput)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{
						nativeFreeOptionListBoxInput.options[i].selected = true;
					}
				},
				
				deselectAllOptions: function (nativeFreeOptionListBoxInput)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{
						nativeFreeOptionListBoxInput.options[i].selected = false;
					}
				},
				
				invertSelectAllOptions: function (nativeFreeOptionListBoxInput)
				{
					for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFreeOptionListBoxInput.options); i < iEnd; ++i)
					{
						if (nativeFreeOptionListBoxInput.options[i].selected)
						{
							nativeFreeOptionListBoxInput.options[i].selected = false;
						}
						else
						{
							nativeFreeOptionListBoxInput.options[i].selected = true;
						}
					}
				}
		},
						
		nativeFileUploadInput:
		{
			// Disabled
				
				setDisabled: function (nativeFileUploadInput, disabled)
				{
					nativeFileUploadInput.disabled = disabled ? true : false;
				},
				
				enable: function (nativeFileUploadInput)
				{
					nativeFileUploadInput.disabled = false;
				},
				
				disable: function (nativeFileUploadInput)
				{
					nativeFileUploadInput.disabled = true;
				},
			
				isDisabled: function (nativeFileUploadInput)
				{
					return nativeFileUploadInput.disabled ? true : false;
				},
			
			// Editable
				
				setEditable: function (nativeFileUploadInput, editable)
				{
					nativeFileUploadInput.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeFileUploadInput)
				{
					nativeFileUploadInput.readOnly = false;
				},
				
				makeReadOnly: function (nativeFileUploadInput)
				{
					nativeFileUploadInput.readOnly = true;
				},
				
				isEditable: function (nativeFileUploadInput)
				{
					return nativeFileUploadInput.readOnly ? false : true;
				},
			
			// Focused
			
				setFocused: function (nativeFileUploadInput, focused)
				{
					if (focused)
					{
						nativeFileUploadInput.focus();
					}
					else
					{
						nativeFileUploadInput.blur();
					}
				},
				
				focus: function (nativeFileUploadInput)
				{
					nativeFileUploadInput.focus();
				},
				
				blur: function (nativeFileUploadInput)
				{
					nativeFileUploadInput.blur();
				},
			
			// AcceptFileMIMETypes
				
				setAcceptFileMIMETypes: function (nativeFileUploadInput, acceptFileMIMETypes)
				{
					if (acceptFileMIMETypes && XXX_Type.isArray(acceptFileMIMETypes))
					{
						if (XXX_Array.getFirstLevelItemTotal(acceptFileMIMETypes) > 0)
						{
							acceptFileMIMETypes = XXX_Array.joinValuesToString(acceptFileMIMETypes, ',');
						}
						else
						{
							acceptFileMIMETypes = '';
						}
					}
					else
					{
						acceptFileMIMETypes = '';
					}
					
					nativeFileUploadInput.accept = acceptFileMIMETypes;
				},
				
				getAcceptFileMIMETypes: function (nativeFileUploadInput)
				{
					var acceptFileMIMETypes = nativeFileUploadInput.accept;
					
					acceptFileMIMETypes = XXX_String.splitToArray(acceptFileMIMETypes, ',');
					
					return acceptFileMIMETypes;
				},
				
			// Value
			
				getValue: function (nativeFileUploadInput)
				{
					return nativeFileUploadInput.value;
				},
			
			// Reset
			
				reset: function (nativeFileUploadInput)
				{
					if (nativeFileUploadInput.reset)
					{
						nativeFileUploadInput.reset();
					}
					if (nativeFileUploadInput.clear)
					{
						nativeFileUploadInput.clear();
					}
					if (nativeFileUploadInput.files && XXX_Array.getFirstLevelItemTotal(nativeFileUploadInput.files) > 0)
					{
						nativeFileUploadInput.files.clear();
						
						nativeFileUploadInput.files = {};
					}
				},
			
			// Files
			
				parseFileForNameAndExtension: function (file)
				{
					var result = false;
					
					if (XXX_Type.isValue(file))
					{					
						var filePart = file;
							
						if (XXX_String.findFirstPosition(file, '/') != -1)
						{
						 	filePart = XXX_String.getLastSeparatedPart(file, '/');
						}
						else if (XXX_String.findFirstPosition(file, '\\') != -1)
						{
						 	filePart = XXX_String.getLastSeparatedPart(file, '\\');
						}
						
						file = filePart;
						
						var extension = file;
						var name = file;
						
						if (XXX_String.findFirstPosition(file, '.') != -1)
						{
							var fileParts = XXX_String.splitToArray(file, '.');
							
							extension = fileParts.pop();
							name = XXX_Array.joinValuesToString(fileParts, '.');
							
							extension = XXX_String.convertToLowerCase(extension);
						
							file = name;
							
							if (extension)
							{
								file += '.' + extension;
							}
						}
						else
						{
							extension = '';
						}
						
						result =
						{
							file: file,
							name: name,
							extension: extension
						};
					}
					
					return result;
				},
				
				getSelectedFiles: function (nativeFileUploadInput)
				{
					var newFiles = [];
					var fileTotal = 0;
					var fileSizeTotal = 0;
					
					if (nativeFileUploadInput.files && XXX_Array.getFirstLevelItemTotal(nativeFileUploadInput.files) > 0)
					{
						for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(nativeFileUploadInput.files); i < iEnd; ++i)
						{
							var tempFile = nativeFileUploadInput.files[i];
							
							var file = tempFile.name;
							
							if (!file && tempFile.fileName)
							{
								file = tempFile.fileName;
							}
							
							var parsedFile = this.parseFileForNameAndExtension(file);
							
							if (parsedFile)
							{	
								var newFile = parsedFile;
										
								var size = tempFile.size;
								
								if (!size && tempFile.fileSize)
								{
									size = tempFile.fileSize;
								}
								
								var mimeType = tempFile.type;
								
								if (!mimeType && tempFile.fileType)
								{
									mimeType = tempFile.fileType;
								}
								
								newFile.size = size;
								newFile.browserMIMEType = mimeType;
								newFile.mimeType = mimeType;
								newFile.nativeHTTPBrowserFile = tempFile;
								
								fileSizeTotal += size;
								++fileTotal;
								
								newFiles.push(newFile);
							}
						}
					}
					else
					{
						var value = nativeFileUploadInput.value;
			
						if (XXX_Type.isValue(value))
						{
							var files = [];
							
							if (XXX_String.findFirstPosition(value, '"') != -1)
							{
								parts = XXX_String.splitToArray(value, '" "');
								
								for (var j = 0, jEnd = XXX_Array.getFirstLevelItemTotal(parts); j < jEnd; ++j)
								{
									var part = parts[j];
									
									if (XXX_String.beginsWith(part, '"'))
									{
										part = XXX_String.getPart(part, 1);
									}
									
									if (XXX_String.endsWith(part, '"'))
									{
										part = XXX_String.getPart(part, 0, -1);
									}
									
									files.push(part);
								}
							}
							else
							{
								files.push(value);
							}
													
							for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(files); i < iEnd; ++i)
							{
								var file = files[i];
								
								var parsedFile = this.parseFileForNameAndExtension(file);
								
								if (parsedFile)
								{
									newFiles.push(parsedFile);
									++fileTotal;
								}
							}
						}
					}
					
					result =
					{
						fileTotal: fileTotal,
						fileSizeTotal: fileSizeTotal,
						files: newFiles
					};
					
					return result;
				}
		},
		
		nativeLink:
		{
			// Disabled
			
				setDisabled: function (nativeLink, disabled)
				{
					nativeLink.disabled = disabled ? true : false;	
				},
				
				enable: function (nativeLink)
				{
					nativeLink.disabled = false;	
				},
				
				disable: function (nativeLink)
				{
					nativeLink.disabled = true;	
				},
							
				isDisabled: function (nativeLink)
				{
					return nativeLink.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeLink, editable)
				{
					nativeLink.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeLink)
				{
					nativeLink.readOnly = false;
				},
				
				makeReadOnly: function (nativeLink)
				{
					nativeLink.readOnly = true;
				},
				
				isEditable: function (nativeLink)
				{
					return nativeLink.readOnly ? false: true;
				},
			
			// Focused
			
				setFocused: function (nativeLink, focused)
				{
					if (focused)
					{
						nativeLink.focus();
					}
					else
					{
						nativeLink.blur();
					}
				},
				
				focus: function (nativeLink)
				{
					nativeLink.focus();
				},
				
				blur: function (nativeLink)
				{
					nativeLink.blur();
				},
			
			// Click
			
				click: function (nativeLink)
				{
					nativeLink.click();
				},
			
			// uri
			
				getURI: function (nativeLink)
				{
					return nativeLink.href;
				},
				
				setURI: function (nativeLink, uri)
				{
					nativeLink.href = uri;
				},
			
			// label
			
				setLabel: function (nativeLink, label)
				{
					XXX_DOM.setContent(nativeLink, label);
				},
				
				getLabel: function (nativeLink)
				{
					return XXX_DOM.getInner(nativeLink);
				}
		},
		
		
		nativeIconLink:
		{
			// Disabled
			
				setDisabled: function (nativeIconLink, disabled)
				{
					nativeIconLink.disabled = disabled ? true : false;	
				},
				
				enable: function (nativeIconLink)
				{
					nativeIconLink.disabled = false;	
				},
				
				disable: function (nativeIconLink)
				{
					nativeIconLink.disabled = true;	
				},
							
				isDisabled: function (nativeIconLink)
				{
					return nativeIconLink.disabled ? true : false;
				},
			
			// Editable
			
				setEditable: function (nativeIconLink, editable)
				{
					nativeIconLink.readOnly = editable ? false : true;
				},
				
				makeEditable: function (nativeIconLink)
				{
					nativeIconLink.readOnly = false;
				},
				
				makeReadOnly: function (nativeIconLink)
				{
					nativeIconLink.readOnly = true;
				},
				
				isEditable: function (nativeIconLink)
				{
					return nativeIconLink.readOnly ? false: true;
				},
			
			// Focused
			
				setFocused: function (nativeIconLink, focused)
				{
					if (focused)
					{
						nativeIconLink.focus();
					}
					else
					{
						nativeIconLink.blur();
					}
				},
				
				focus: function (nativeIconLink)
				{
					nativeIconLink.focus();
				},
				
				blur: function (nativeIconLink)
				{
					nativeIconLink.blur();
				},
			
			// Click
			
				click: function (nativeIconLink)
				{
					nativeIconLink.click();
				},
			
			// uri
			
				getURI: function (nativeIconLink)
				{
					return nativeIconLink.href;
				},
				
				setURI: function (nativeIconLink, uri)
				{
					nativeIconLink.href = uri;
				},
			
			// label
			
				setLabel: function (nativeIconLink, label)
				{
					XXX_DOM.setContent(nativeIconLink, label);
				},
				
				getLabel: function (nativeIconLink)
				{
					return XXX_DOM.getInner(nativeIconLink);
				}
		},
		
		
		nativeAnchor:
		{
			getAnchor: function (nativeAnchor)
			{
				return nativeAnchor.name;
			},
			
			setAnchor: function (nativeAnchor, anchor)
			{
				nativeAnchor.name = anchor;
			},
			
			setLabel: function (nativeAnchor, label)
			{
				XXX_DOM.setContent(nativeAnchor, label);
			},
			
			getLabel: function (nativeAnchor)
			{
				return XXX_DOM.getInner(nativeAnchor);
			}
		},
				
		nativeSelectionHandling:
		{
			
			/*
			
			Internet Explorer: (http://msdn.microsoft.com/en-us/library/ms535872%28v=VS.85%29.aspx)
			- end point: either the start or end of a selection
			
			Other: (https://developer.mozilla.org/en/XUL/Method/setSelectionRange)
					
			If the textarea contains line-feeds, the selection will be off by one for every line-feed.
				
			However, doGetCaretPosition does not work in IE if there are carriage returns in the textarea.
			I'm not sure exactly why but IE must remove them from the selection or something.
			The returned caret position will be off by one for every carriage return in the textarea prior to the caret position.
			
			Er, actually I meant line-feeds, not carriage returns.
			
			Mozilla telt alleen de echte characters.
			IE ook de line-feeds
			
			TODO figure out IE line-feed bug.
			
			*/
			
			enable: function (nativeVisualCharacterInput, nativeCharacterInputType)
			{
				var result = false;
			
				nativeVisualCharacterInput._XXX_selectionMethod = false;
				
				if (nativeCharacterInputType)
				{			
					nativeVisualCharacterInput._XXX_nativeCharacterInputType = nativeCharacterInputType;
				}
				else
				{
					if (XXX_String.convertToLowerCase(nativeVisualCharacterInput.tagName) == 'textarea')
					{
						nativeVisualCharacterInput._XXX_nativeCharacterInputType = 'nativeCharacterLinesInput';	
					}
					else if (XXX_String.convertToLowerCase(nativeVisualCharacterInput.tagName) == 'input' && (XXX_String.convertToLowerCase(nativeVisualCharacterInput.type) == 'text' || XXX_String.convertToLowerCase(nativeVisualCharacterInput.type) == 'password'))
					{
						nativeVisualCharacterInput._XXX_nativeCharacterInputType = 'nativeCharacterLineInput';	
					}
				}
				
				//nativeVisualCharacterInput.focus();
				
				if (nativeVisualCharacterInput.setSelectionRange)
				{
					nativeVisualCharacterInput._XXX_selectionMethod = 'mozilla';	
				}
				else if (document.selection && document.selection.createRange && nativeVisualCharacterInput.createTextRange)
				{
					nativeVisualCharacterInput._XXX_selectionMethod = 'internetExplorer';			
				}
						
				if (nativeVisualCharacterInput._XXX_nativeCharacterInputType !== false && nativeVisualCharacterInput._XXX_selectionMethod !== false)
				{
					nativeVisualCharacterInput._XXX_storeSelectionRange = function ()
					{
						this._XXX_lastSelectionRange = XXX_DOM_NativeHelpers.nativeSelectionHandling.getSelectionRange(this);
					};
					
					nativeVisualCharacterInput._XXX_restoreSelectionRange = function ()
					{
						// Make it only usable once
						if (this._XXX_lastSelectionRange)
						{
							 XXX_DOM_NativeHelpers.nativeSelectionHandling.setSelectionRange(this, this._XXX_lastSelectionRange.start, this._XXX_lastSelectionRange.length);
							
							this._XXX_lastSelectionRange = false;
						}
					};
					
					result = true;
				}
				
				//nativeVisualCharacterInput.blur();
								
				return result;
			},
			
			getSelectionRange: function (nativeVisualCharacterInput)
			{
				var result =
				{
					start: 0,
					end: 0,
					length: 0
				};
						
				if (nativeVisualCharacterInput._XXX_selectionMethod == 'mozilla')
				{
					result.start = nativeVisualCharacterInput.selectionStart;
					result.end = nativeVisualCharacterInput.selectionEnd;
				}
				else if (nativeVisualCharacterInput._XXX_selectionMethod == 'internetExplorer')
				{
					//nativeVisualCharacterInput.focus();
					
					// The original selection
					var originalSelectionRange = document.selection.createRange();
					
					// A dummy selection to manipulate for calculations
					var dummySelectionRange = originalSelectionRange.duplicate();
									
					// Set the dummy selection to encapsulate all the text in the text input
					
					if (nativeVisualCharacterInput._XXX_nativeCharacterInputType == 'nativeCharacterLinesInput')
					{
						dummySelectionRange.moveToElementText(nativeVisualCharacterInput);
					}
					else
					{
						dummySelectionRange.expand('textedit');
					}
					
					// Set the dummy selection end point back to the original selection end point
					dummySelectionRange.setEndPoint('EndToEnd', originalSelectionRange);
								
					// The start is calculable by substracting the original selection character length from the dummy selection character length
					result.start = XXX_String.getCharacterLength(dummySelectionRange.text) - XXX_String.getCharacterLength(originalSelectionRange.text);
					// The end is calculable by adding the original selection character length to the start
					result.end = result.start + XXX_String.getCharacterLength(originalSelectionRange.text);
				}
						
				result.length = result.end - result.start;
						
				return result;
			},
			
			setSelectionRange: function (nativeVisualCharacterInput, offset, length)
			{
				if (nativeVisualCharacterInput._XXX_selectionMethod == 'mozilla')
				{
					nativeVisualCharacterInput.setSelectionRange(offset, offset + length);
				}
				else if (nativeVisualCharacterInput._XXX_selectionMethod == 'internetExplorer')
				{
					//nativeVisualCharacterInput.focus();
					
					var selectionRange = document.selection.createRange();
					
					// Set selection to encapsulate all the text in the text input
					
					if (nativeVisualCharacterInput._XXX_nativeCharacterInputType == 'characterLines')
					{
						selectionRange.moveToElementText(nativeVisualCharacterInput);
					}
					else
					{
						selectionRange.expand('textedit');
					}
					
					// Defeat new line bug http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/#comment-20
					var newLinesBefore = (XXX_Array.getFirstLevelItemTotal(XXX_String.splitToArray(XXX_String.getPart(nativeVisualCharacterInput.value, 0, offset), '\n')) - 1);
					var newLinesAfter = (XXX_Array.getFirstLevelItemTotal(XXX_String.splitToArray(XXX_String.getPart(nativeVisualCharacterInput.value, offset + length), '\n')) - 1)
											
					selectionRange.moveStart('character', offset - newLinesBefore);
					
					//selectionRange.moveEnd('character', offset + (length - XXX_String.getCharacterLength(nativeVisualCharacterInput.value)));
					selectionRange.moveEnd('character', -(XXX_String.getCharacterLength(nativeVisualCharacterInput.value) - (offset + length) - newLinesAfter));
					
					selectionRange.select();
				}
						
				//nativeVisualCharacterInput.focus();
			},
			
			selectAll: function (nativeVisualCharacterInput)
			{
				var value = nativeVisualCharacterInput.value;
				var length = XXX_String.getCharacterLength(value);
				
				XXX_DOM_NativeHelpers.nativeSelectionHandling.setSelectionRange(nativeVisualCharacterInput, 0, length);
			},
			
			getCaretPosition: function (nativeVisualCharacterInput)
			{
				var result = 0;
			
				var selectionRange = XXX_DOM_NativeHelpers.nativeSelectionHandling.getSelectionRange(nativeVisualCharacterInput);
				
				result = selectionRange.start;
				
				return result;
			},
			
			setCaretPosition: function (nativeVisualCharacterInput, offset)
			{
				XXX_DOM_NativeHelpers.nativeSelectionHandling.setSelectionRange(nativeVisualCharacterInput, offset, 0);
			},
			
			getSelectionText: function (nativeVisualCharacterInput)
			{
				var result = '';
			
				var value = nativeVisualCharacterInput.value;
				var selectionRange = XXX_DOM_NativeHelpers.nativeSelectionHandling.getSelectionRange(nativeVisualCharacterInput);
				
				result = XXX_String.getPart(value, selectionRange.start, selectionRange.length);
				
				return result;
			},
			
			setSelectionText: function (nativeVisualCharacterInput, selectionOverwriteText)
			{
				var scrollTop;
			
				if (nativeVisualCharacterInput._XXX_nativeCharacterInputType == 'nativeCharacterLinesInput')
				{
					scrollTop = nativeVisualCharacterInput.scrollTop;
				}
				
				var value = nativeVisualCharacterInput.value;
				var valueCharacterLength = XXX_String.getCharacterLength(value);
				
				var selectionRange = XXX_DOM_NativeHelpers.nativeSelectionHandling.getSelectionRange(nativeVisualCharacterInput);
				
				var beforePart = XXX_String.getPart(value, 0, selectionRange.start);
				var selectionPart = XXX_String.getPart(value, selectionRange.start, selectionRange.length);
				var afterPart = XXX_String.getPart(value, selectionRange.end, valueCharacterLength - selectionRange.end);
				
				nativeVisualCharacterInput.value = beforePart + selectionOverwriteText + afterPart;
				
				XXX_DOM_NativeHelpers.nativeSelectionHandling.setSelectionRange(nativeVisualCharacterInput, selectionRange.start + XXX_String.getCharacterLength(selectionOverwriteText), 0);
				
				//nativeVisualCharacterInput.focus();
				
				if (nativeVisualCharacterInput._XXX_nativeCharacterInputType == 'nativeCharacterLinesInput')
				{
					nativeVisualCharacterInput.scrollTop = scrollTop;
				}
			},
			
			wrapSelectionText: function (nativeVisualCharacterInput, wrapOpeningText, wrapClosingText)
			{
				var scrollTop;
			
				if (nativeVisualCharacterInput._XXX_nativeCharacterInputType == 'nativeCharacterLinesInput')
				{
					scrollTop = nativeVisualCharacterInput.scrollTop;
				}
				
				var value = nativeVisualCharacterInput.value;
				var valueCharacterLength = XXX_String.getCharacterLength(value);
				
				var selectionRange = XXX_DOM_NativeHelpers.nativeSelectionHandling.getSelectionRange(nativeVisualCharacterInput);
						
				var beforePart = XXX_String.getPart(value, 0, selectionRange.start);
				var selectionPart = XXX_String.getPart(value, selectionRange.start, selectionRange.length);
				var afterPart = XXX_String.getPart(value, selectionRange.end, valueCharacterLength - selectionRange.end);
				
				nativeVisualCharacterInput.value = beforePart + wrapOpeningText + selectionPart + wrapClosingText + afterPart;
				
				var newSelectionRange =
				{
					offset: selectionRange.start + XXX_String.getCharacterLength(wrapOpeningText),
					length: XXX_String.getCharacterLength(selectionPart)
				};
						
				XXX_DOM_NativeHelpers.nativeSelectionHandling.setSelectionRange(nativeVisualCharacterInput, newSelectionRange.offset, newSelectionRange.length);
						
				var postSelectionRange = XXX_DOM_NativeHelpers.nativeSelectionHandling.getSelectionRange(nativeVisualCharacterInput);
						
				//nativeVisualCharacterInput.focus();
				
				if (nativeVisualCharacterInput._XXX_nativeCharacterInputType == 'nativeCharacterLinesInput')
				{
					nativeVisualCharacterInput.scrollTop = scrollTop;
				}
			}
		},
		
		nativeTable:
		{
			getSection: function (nativeTable, section)
			{
				var result = false;
								
				if (section == 'header')
				{
					result = nativeTable.tHead;	
				}
				else if (section == 'footer')
				{
					result = nativeTable.tFoot;	
				}
				else
				{
					result = nativeTable.tBodies[0];	
				}
				
				return result;
			},
			
			getRow: function (nativeTable, section, row)
			{
				var result = false;
				
				section = this.getSection(nativeTable, section);
				
				if (section)
				{
					result = section.rows[row];	
				}
				
				return result;
			},
			
			getCell: function (nativeTable, section, row, cell)
			{
				var result = false;
				
				row = this.getRow(nativeTable, section, row);
				
				if (row)
				{
					result = row.cells[cell];
				}
				
				return result;
			}
		}
	};
