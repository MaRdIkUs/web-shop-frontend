using System;
using System.Collections.Generic;

namespace WebShop.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public int Count { get; set; }
        public int Popularity { get; set; }
        public int ImagesCount { get; set; }
        public string Image { get; set; }
        public bool IsActive { get; set; }
        public List<ProductTag> Tags { get; set; } = new List<ProductTag>();
        public List<ProductSpec> Specs { get; set; } = new List<ProductSpec>();
    }

    public class ProductTag
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public int ProductId { get; set; }
    }

    public class ProductSpec
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public int ProductId { get; set; }
    }

    public class CreateProductRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public int Count { get; set; }
        public int Popularity { get; set; }
        public List<ProductTagRequest> Tags { get; set; } = new List<ProductTagRequest>();
        public List<ProductSpecRequest> Specs { get; set; } = new List<ProductSpecRequest>();
    }

    public class ProductTagRequest
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }

    public class ProductSpecRequest
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
} 