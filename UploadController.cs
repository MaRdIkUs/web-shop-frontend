using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace WebShop.Controllers
{
    [ApiController]
    [Route("api/images")]
    public class UploadController : ControllerBase
    {
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "products");

        public UploadController()
        {
            // Создаем директорию для загрузок если её нет
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        [HttpPost("upload/category/{categoryId}/product/{productId}")]
        public async Task<IActionResult> UploadProductImage(int categoryId, int productId, [FromForm] IFormFile image)
        {
            try
            {
                if (image == null || image.Length == 0)
                {
                    return BadRequest("Файл изображения не выбран");
                }

                // Проверяем тип файла
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(image.ContentType.ToLower()))
                {
                    return BadRequest("Неподдерживаемый тип файла. Разрешены только JPEG, PNG и GIF");
                }

                // Проверяем размер файла (максимум 5MB)
                if (image.Length > 5 * 1024 * 1024)
                {
                    return BadRequest("Размер файла превышает 5MB");
                }

                // Создаем уникальное имя файла
                var fileName = $"{productId}_{DateTime.Now:yyyyMMddHHmmss}_{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(_uploadPath, fileName);

                // Сохраняем файл
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Возвращаем информацию о загруженном файле
                var response = new
                {
                    success = true,
                    message = "Изображение успешно загружено",
                    fileName = fileName,
                    filePath = $"/uploads/products/{fileName}",
                    productId = productId,
                    categoryId = categoryId,
                    fileSize = image.Length,
                    contentType = image.ContentType
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Ошибка загрузки изображения: {ex.Message}" });
            }
        }

        [HttpGet("uploads/products/{fileName}")]
        public IActionResult GetProductImage(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadPath, fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("Файл не найден");
                }

                var contentType = GetContentType(fileName);
                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Ошибка получения изображения: {ex.Message}" });
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }
} 