# Vue2Loader

- help use vue2 in multi-page-application website
- this could improve coding style & structure
- bring out simplify , purify vue code like vue-cli
- but also, it has some restrict with it
- such as, could not use 'import' and 'export' segments for process other modules
- only support use 'export default' to  export default vue component(or instance)
- so that, import other modules must by global '&lt;script&gt;' in html

---

## comp.vue

- this is a ***comp.vue*** file

```html
<template>
  <div class="comp">
    {{message}}
  </div>
</template>

<header>
  <title>vue2-loader</title>
</header>

<script>
export default {
  name: "comp",
  data(){
    return {
      message: 'xxx',
      timer:null
    }
  },
  mounted(){
    this.timer=setInterval(()=>{
      this.message=new Date()+''
    },1000)
  },
  destroyed(){
    clearInterval(this.timer)
  }
}
</script>

<style>
.comp{
  color: red;
}
.--this span{
 color: #444;
}
</style>
```

## comp.html

- this is a ***comp.html*** file

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <!-- <script src="./vue@2_dist_vue.js"></script> -->
    <title>vue2</title>
    <script src="./vue2-loader.js"></script>

</head>
<body>

</body>
<script>
    Vue2Loader.setupVueApp({
        url:'./comp.vue'
    })

</script>
<style>

</style>
</html>
```

---

- now, you got an vue page ***comp.html***,and could be view it in browser
- but also, if you want view page in local file, 
- you must use ***vue2-converter.js*** to convert as local ***cors-origin*** support format(jsonp)
- or direct use ***convertor.html*** to complete this work.
