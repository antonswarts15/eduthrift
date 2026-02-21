package za.co.thrift.eduthrift.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import za.co.thrift.eduthrift.entity.*;
import za.co.thrift.eduthrift.repository.*;
import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = {"https://www.eduthrift.co.za", "https://eduthrift.co.za", "https://admin.eduthrift.co.za", "http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ItemTypeRepository itemTypeRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    @GetMapping("/categories/{categoryId}/item-types")
    public List<ItemType> getItemTypesByCategory(@PathVariable Long categoryId) {
        return itemTypeRepository.findByCategoryId(categoryId);
    }
    
    @GetMapping("/item-types/{itemTypeId}/items")
    public List<Item> getItemsByType(@PathVariable Long itemTypeId) {
        return itemRepository.findByItemTypeId(itemTypeId);
    }
    
}