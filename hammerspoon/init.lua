local function keyCode(key, modifiers)
   modifiers = modifiers or {}
   return function()
      hs.eventtap.event.newKeyEvent(modifiers, string.lower(key), true):post()
      hs.timer.usleep(1000)
      hs.eventtap.event.newKeyEvent(modifiers, string.lower(key), false):post()
   end
end

local function remapKey(modifiers, key, keyCode)
   hs.hotkey.bind(modifiers, key, keyCode, nil, keyCode)
end

remapKey({'ctrl'}, 'h', keyCode('left'))
remapKey({'ctrl'}, 'j', keyCode('down'))
remapKey({'ctrl'}, 'k', keyCode('up'))
remapKey({'ctrl'}, 'l', keyCode('right'))
remapKey({'ctrl'}, 'n', keyCode('delete'))
remapKey({'ctrl'}, 'm', keyCode('forwarddelete'))
remapKey({'ctrl'}, ',', keyCode('forwarddelete'))


remapKey({'ctrl', 'shift'}, 'h', keyCode('left', {'shift'}))
remapKey({'ctrl', 'shift'}, 'j', keyCode('down', {'shift'}))
remapKey({'ctrl', 'shift'}, 'k', keyCode('up', {'shift'}))
remapKey({'ctrl', 'shift'}, 'l', keyCode('right', {'shift'}))
remapKey({'ctrl', 'shift'}, 'n', keyCode('delete', {'shift'}))
remapKey({'ctrl', 'shift'}, 'm', keyCode('forwarddelete', {'shift'}))
remapKey({'ctrl', 'shift'}, ',', keyCode('forwarddelete', {'shift'}))

remapKey({'ctrl', 'cmd'}, 'h', keyCode('left', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'j', keyCode('down', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'k', keyCode('up', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'l', keyCode('right', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'n', keyCode('delete', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'm', keyCode('forwarddelete', {'cmd'}))
remapKey({'ctrl', 'cmd'}, ',', keyCode('forwarddelete', {'cmd'}))

remapKey({'ctrl', 'shift', 'cmd'}, 'h', keyCode('left', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'j', keyCode('down', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'k', keyCode('up', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'l', keyCode('right', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'n', keyCode('delete', {'shift','cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'm', keyCode('forwarddelete', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, ',', keyCode('forwarddelete', {'shift', 'cmd'}))

remapKey({'ctrl', 'alt'}, 'h', keyCode('left', {'alt'}))
remapKey({'ctrl', 'alt'}, 'j', keyCode('down', {'alt'}))
remapKey({'ctrl', 'alt'}, 'k', keyCode('up', {'alt'}))
remapKey({'ctrl', 'alt'}, 'l', keyCode('right', {'alt'}))
remapKey({'ctrl', 'alt'}, 'n', keyCode('delete', {'alt'}))
remapKey({'ctrl', 'alt'}, 'm', keyCode('forwarddelete', {'alt'}))
remapKey({'ctrl', 'alt'}, ',', keyCode('forwarddelete', {'alt'}))

remapKey({'ctrl', 'shift', 'alt'}, 'h', keyCode('left', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'j', keyCode('down', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'k', keyCode('up', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'l', keyCode('right', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'n', keyCode('delete', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'm', keyCode('forwarddelete', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, ',', keyCode('forwarddelete', {'shift', 'alt'}))

remapKey({'ctrl', 'cmd', 'alt'}, 'h', keyCode('left', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'j', keyCode('down', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'k', keyCode('up', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'l', keyCode('right', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'n', keyCode('delete', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'm', keyCode('forwarddelete', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, ',', keyCode('forwarddelete', {'cmd', 'alt'}))
