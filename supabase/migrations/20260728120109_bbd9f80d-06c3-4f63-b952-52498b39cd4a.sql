-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- REGIONS
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regions TO authenticated;
GRANT ALL ON public.regions TO service_role;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published regions" ON public.regions FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all regions" ON public.regions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert regions" ON public.regions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update regions" ON public.regions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete regions" ON public.regions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LOCATIONS
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  culture_history text NOT NULL DEFAULT '',
  activities text NOT NULL DEFAULT '',
  suggestions text NOT NULL DEFAULT '',
  visit_time text NOT NULL DEFAULT '',
  ticket_price text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  contact text NOT NULL DEFAULT '',
  cover_image_url text,
  video_url text,
  map_embed_url text,
  latitude double precision,
  longitude double precision,
  audio_vi_url text,
  audio_en_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published locations" ON public.locations FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all locations" ON public.locations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert locations" ON public.locations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update locations" ON public.locations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete locations" ON public.locations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX locations_region_idx ON public.locations(region_id, sort_order);

-- IMAGES
CREATE TABLE public.location_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_images TO authenticated;
GRANT ALL ON public.location_images TO service_role;
ALTER TABLE public.location_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view images of published locations" ON public.location_images FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.published = true));
CREATE POLICY "Admins can view all images" ON public.location_images FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can insert images" ON public.location_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update images" ON public.location_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete images" ON public.location_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX location_images_loc_idx ON public.location_images(location_id, sort_order);

-- SEED
INSERT INTO public.regions (slug, name, tagline, description, sort_order, published) VALUES
('rach-gia', 'Rạch Giá', 'Cửa ngõ biển Tây Nam Bộ', 'Rạch Giá là đô thị biển sôi động của vùng Tây Nam Bộ, nơi giao thoa giữa văn hoá Nam Bộ, kiến trúc tâm linh và nhịp sống biển. Đây cũng là cửa ngõ đi Phú Quốc, Nam Du và Hòn Sơn.', 1, true);

INSERT INTO public.locations (region_id, slug, name, address, short_description, description, highlights, culture_history, activities, suggestions, visit_time, ticket_price, notes, sort_order, published)
SELECT r.id, 'den-tuong-niem-anh-hung-liet-si',
'Đền tưởng niệm anh hùng liệt sĩ, người có công',
'99 Võ Trường Toản, Rạch Giá, An Giang',
'Công trình kiến trúc tâm linh và lịch sử mới của trung tâm Rạch Giá, khuôn viên rộng khoảng 3,5 ha.',
'Đền tưởng niệm anh hùng liệt sĩ, người có công là công trình kiến trúc tâm linh và lịch sử mới được hoàn thiện và đưa vào sử dụng cuối năm 2025. Toạ lạc ngay trung tâm phường Rạch Giá với khuôn viên rộng khoảng 3,5 ha, nơi đây là không gian tưởng niệm trang nghiêm, đồng thời là điểm dừng chân thuận tiện cho các đoàn khách du lịch.',
ARRAY['Công trình kiến trúc tâm linh và lịch sử mới','Hoàn thiện và đưa vào sử dụng cuối năm 2025','Vị trí tại trung tâm phường Rạch Giá','Khuôn viên rộng khoảng 3,5 ha','Thuận tiện cho xe du lịch lớn đỗ và trả khách','Gần bến tàu','Có thể kết hợp vào các hành trình du lịch đảo như Phú Quốc, Nam Du và Lại Sơn'],
'Công trình thể hiện lòng tri ân của nhân dân địa phương đối với các anh hùng liệt sĩ và người có công với cách mạng.',
'Dâng hương tưởng niệm, tham quan khuôn viên, tìm hiểu lịch sử địa phương và chụp ảnh kiến trúc.',
'Nên kết hợp tham quan trước hoặc sau khi ra bến tàu đi Phú Quốc, Nam Du, Lại Sơn.',
'Khoảng 30 - 45 phút', 'Miễn phí', 'Trang phục lịch sự, giữ gìn trật tự và vệ sinh trong khuôn viên đền.', 1, true
FROM public.regions r WHERE r.slug = 'rach-gia';

INSERT INTO public.locations (region_id, slug, name, address, short_description, description, highlights, culture_history, activities, suggestions, visit_time, ticket_price, notes, sort_order, published)
SELECT r.id, 'dinh-than-nguyen-trung-truc',
'Đình thần Nguyễn Trung Trực',
'Số 14 Nguyễn Công Trứ, phường Rạch Giá, tỉnh An Giang',
'Biểu tượng văn hoá – lịch sử tiêu biểu của Rạch Giá, gắn liền với anh hùng dân tộc Nguyễn Trung Trực.',
'Đình thần Nguyễn Trung Trực là một trong những biểu tượng văn hoá – lịch sử tiêu biểu của Rạch Giá, gắn liền với tên tuổi anh hùng dân tộc Nguyễn Trung Trực. Ngôi đình thể hiện tinh thần yêu nước và nét văn hoá Nam Bộ đặc trưng, nằm ở vị trí trung tâm thuận tiện kết nối với nhiều điểm tham quan khác.',
ARRAY['Một trong những biểu tượng văn hoá – lịch sử tiêu biểu của Rạch Giá','Gắn liền với tên tuổi anh hùng dân tộc Nguyễn Trung Trực','Thể hiện tinh thần yêu nước và văn hoá Nam Bộ','Nằm ở vị trí trung tâm','Thuận tiện kết nối với Bảo tàng Kiên Giang','Gần Công viên lấn biển','Gần Khu đô thị Phú Cường','Gần Chợ đêm Rạch Giá','Cách Cảng hành khách Rạch Giá một quãng đường ngắn','Có thể kết hợp tham quan trước khi đi Phú Quốc, Nam Du hoặc Hòn Sơn'],
'Đình thờ anh hùng dân tộc Nguyễn Trung Trực, người lãnh đạo nghĩa quân chống Pháp với câu nói bất hủ về tinh thần bất khuất của dân tộc. Hằng năm nơi đây diễn ra lễ hội truyền thống thu hút đông đảo người dân và du khách.',
'Dâng hương, tìm hiểu kiến trúc đình Nam Bộ, tham dự lễ hội truyền thống, dạo Chợ đêm Rạch Giá gần đó.',
'Kết hợp tham quan Bảo tàng Kiên Giang, Công viên lấn biển và Chợ đêm Rạch Giá trong cùng buổi.',
'Khoảng 30 - 60 phút', 'Miễn phí', 'Trang phục lịch sự khi vào khu vực thờ tự.', 2, true
FROM public.regions r WHERE r.slug = 'rach-gia';

INSERT INTO public.locations (region_id, slug, name, short_description, sort_order, published)
SELECT r.id, 'dia-diem-moi', 'Địa điểm mới (chờ cập nhật)', 'Địa điểm mẫu để quản trị viên cập nhật nội dung, hình ảnh, video và audio.', 3, false
FROM public.regions r WHERE r.slug = 'rach-gia';