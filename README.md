#RS style guide backend

#1. Comment code a lot.
ex.
```
 /**
 * Description
 * 
 * 
 * @param {Integer} num desc
 * @param {String} str
 * @returns {String}
 */
function(num, str) {
   return "test";
}
```

#2. Document APIs. Chack first example for it in `logic/user.js`. We use `http://apidocjs.com/#getting-started` for that. Documentation blocks write in logic.

#3. Limit your lines to 80 characters.

#4. Use single quotes, unless you are writing JSON.

#5. Always put semicolon`(;)` on end.

#6. Opening braces go on the same line.

#7. Use lowerCamelCase for variables and methods

#8. Use UPPERCASE for Constants

#9. Write small functions

#10. Use pre defined handlers for api responses where is it possible

#11. Give descriptive name to methods and properties

#12. Method chaining -> use one method per line.

#13. Requires:

Organize your node requires in the following order:
```
core modules
npm modules
others
```

#14. Always check for errors in callbacks:

ex.
```
database.get('drabonballs', function(err, drabonballs) {
  if (err) {
    // handle the error somehow, maybe return with a callback
    return console.log(err);
  }
  console.log(drabonballs);
});
```


#15. Format code.

#16. this use like in ex. `var _this = this;`