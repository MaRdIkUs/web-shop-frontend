using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using WebShop.Models;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private static List<Product> _products = new List<Product>();
        private static int _nextId = 1;

        [HttpGet]
        public ActionResult<List<Product>> GetAll([FromQuery] int? categoryId = null)
        {
            var products = _products.AsQueryable();
            
            if (categoryId.HasValue)
            {
                products = products.Where(p => p.CategoryId == categoryId.Value);
            }

            return Ok(products.ToList());
        }

        [HttpGet("{id}")]
        public ActionResult<Product> GetById(int id)
        {
            var product = _products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        [HttpPost]
        public ActionResult<Product> Create([FromBody] CreateProductRequest request)
        {
            var product = new Product
            {
                Id = _nextId++,
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                CategoryId = request.CategoryId,
                Count = request.Count,
                Popularity = request.Popularity,
                ImagesCount = 0,
                IsActive = request.Count > 0,
                Tags = request.Tags.Select(t => new ProductTag
                {
                    Id = _nextId++,
                    Name = t.Name,
                    Value = t.Value,
                    ProductId = _nextId - 1
                }).ToList(),
                Specs = request.Specs.Select(s => new ProductSpec
                {
                    Id = _nextId++,
                    Name = s.Name,
                    Value = s.Value,
                    ProductId = _nextId - 1
                }).ToList()
            };

            _products.Add(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public ActionResult<Product> Update(int id, [FromBody] CreateProductRequest request)
        {
            var product = _products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                return NotFound();
            }

            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.CategoryId = request.CategoryId;
            product.Count = request.Count;
            product.Popularity = request.Popularity;
            product.IsActive = request.Count > 0;
            product.Tags = request.Tags.Select(t => new ProductTag
            {
                Id = _nextId++,
                Name = t.Name,
                Value = t.Value,
                ProductId = product.Id
            }).ToList();
            product.Specs = request.Specs.Select(s => new ProductSpec
            {
                Id = _nextId++,
                Name = s.Name,
                Value = s.Value,
                ProductId = product.Id
            }).ToList();

            return Ok(product);
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var product = _products.FirstOrDefault(p => p.Id == id);
            if (product == null)
            {
                return NotFound();
            }

            _products.Remove(product);
            return NoContent();
        }
    }
} 