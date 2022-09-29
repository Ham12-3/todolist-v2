//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");


mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");


const itemsSchema= new mongoose.Schema({
name:String

});


const Item = mongoose.model("Item",itemsSchema);


const item1= new Item ({
name:"Welcome to the todolist app"
});

const item2= new Item ({
  name:"Click this  <-- to delete"
  });

const item3= new Item ({
  name:"click the + sign to add a new item"
    });

const defaultItems=[item1,item2,item3];


const listSchema = {
  name:String,
  items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);





const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

Item.find({}, function(err,foundItem) {
  if(foundItem.length===0) {
    Item.insertMany(defaultItems,function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Sucessfully created");
      }
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle:"Today", newListItems:foundItem });
  }

});

  

});
app.get("/:customList", function(req,res) {
    const customListName = _.capitalize(req.params.customList);


    List.findOne({name:customListName}, function(err,foundList) {
        if(!err) {
          if(!foundList) {
              
    const list =new List ({
      name:customListName,
      items:defaultItems
   });
   list.save();
   res.redirect("/"+customListName);
          } else {
            res.render("list", {listTitle:foundList.name, newListItems:foundList.items });
           
          }
        }
    });



});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const topic= req.body.list;
  const item =new Item({
    name:itemName
    });

  if(topic==="Today") {
  
      item.save();
      res.redirect("/");
  } else {
    List.findOne({name:topic}, function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + topic);
    });
  }
  
});
app.post("/delete", function(req,res) {
  const checkedItemById=req.body.item;
  const deleted=req.body.listName;


Item.findByIdAndRemove(checkedItemById, function(err){
  if(!err) {
    res.redirect("/");
  }
});
  
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
