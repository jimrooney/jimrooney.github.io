// Prototype .clear() onto all DOM elements
// Removes all children of a node
HTMLElement.prototype.empty = function () {
    while (this.firstChild) {
      this.removeChild(this.firstChild)
    }
  }
  
  Array.prototype.each = Array.prototype.forEach // jQuery style method
  
  
  // jQuery style DOM selector... cuz it's easier
  // Defaults to ID
  // But with a . syntax it will get the class
  // Not sure this will work well with multiple selectors.
  function $(x) {
    let ret
    const type = x.slice(0,1)
    switch (type){
      case ".":
      ret = Array.from(document.getElementsByClassName(x.slice(1,x.length)))
      break
      default :
      ret = document.getElementById(x)
      break
    }
    return ret
  }
  function toggleDiv(ID) {
    let x = ID
    if (typeof ID == "string") {
      x = document.getElementById(ID)
    }
    if (x.style.display === "none") {
      x.style.display = "block"
    } else {
      x.style.display = "none"
    }
  }

  class ElementCollection extends Array {
    ready(cb) {
      const isReady = this.some((e) => {
        return e.readyState != null && e.readyState != "loading"
      })
      if (isReady) {
        cb()
      } else {
        this.on("DOMContentLoaded", cb)
      }
      return this
    }
    each(callback) {
      this.forEach(callback)
      return this
    }
    on(event, cbOrSelector, cb) {
      if (typeof cbOrSelector === "function") {
        this.forEach((e) => e.addEventListener(event, cbOrSelector))
      } else {
        this.forEach((elem) => {
          elem.addEventListener(event, (e) => {
            if (e.target.matches(cbOrSelector)) cb(e)
          })
        })
      }
      return this
    }
  
    next() {
      return this.map((e) => e.nextElementSibling).filter((e) => e != null)
    }
  
    prev() {
      return this.map((e) => e.previousElementSibling).filter((e) => e != null)
    }
  
    removeClass(className) {
      this.forEach((e) => e.classList.remove(className))
      return this
    }
  
    addClass(className) {
      this.forEach((e) => e.classList.add(className))
      return this
    }
  
    css(property, value) {
      const camelProp = property.replace(/(-[a-z])/, (g) => {
        return g.replace("-", "").toUpperCase()
      })
      this.forEach((e) => (e.style[camelProp] = value))
      return this
    }
    append(html) {
      this.forEach((elem) => {
        elem.insertAdjacentHTML("beforeend", html)
      })
      return this
    }
    prepend(html) {
      this.forEach((elem) => {

                this.innerHTML += elem
        // elem.insertAdjacentHTML("afterbegin", html)
      })
      return this
    }
  }
  // -----------------------------------------------
  // Ajax support
  // -----------------------------------------------
  class AjaxPromise {
    constructor(promise) {
      this.promise = promise
    }
  
    done(cb) {
      this.promise = this.promise.then((data) => {
        cb(data)
        return data
      })
      return this
    }
  
    fail(cb) {
      this.promise = this.promise.catch(cb)
      return this
    }
  
    always(cb) {
      this.promise = this.promise.finally(cb)
      return this
    }
  }
  // ----------------------------------------------------------------
  // JimQuery Object
  // ----------------------------------------------------------------
  function $(param) {
    if (!param) {
      return new ElementCollection(document)
    }
    if (typeof param === "string" || param instanceof String) {

      // Check if the param starts with '#' or '.'
      if (param.startsWith('<')) {
        param = param.substring(1) // Remove the leading '<' character
        return new ElementCollection(document.querySelector(param))
      }
      return new ElementCollection(...document.querySelectorAll(param))
    } else {
      return new ElementCollection(param)
    }
  }
  
  $.get = function ({ url, data = {}, success = () => {}, dataType }) {
    const queryString = Object.entries(data)
      .map(([key, value]) => {
        return `${key}=${value}`
      })
      .join("&")
  
    return new AjaxPromise(
      fetch(`${url}?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": dataType,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            throw new Error(res.status)
          }
        })
        .then((data) => {
          success(data)
          return data
        })
    )
  }
  